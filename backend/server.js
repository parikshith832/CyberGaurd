// server.js (final) - sandbox runner, SQLite logging, auth, local AI helper

require('dotenv').config(); // load .env into process.env
const { selectTestsForDifficulty } = require('./attackTests');

const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs/promises');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-super-secret';

const app = express();
app.use(cors());
app.use(express.json());

// -------- Auth routes (register + login) --------

// Register a new user
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  const hash = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)',
    [username, hash],
    function (err) {
      if (err) {
        console.error('Register error:', err.message);
        return res.status(400).json({ error: 'Username taken or DB error' });
      }
      res.json({ id: this.lastID, username });
    }
  );
});

// Login existing user
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, row) => {
      if (err) {
        console.error('Login DB error:', err.message);
        return res.status(500).json({ error: 'DB error' });
      }
      if (!row) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const ok = bcrypt.compareSync(password, row.password_hash);
      if (!ok) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: row.id, username: row.username },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({ token });
    }
  );
});

// -------- Local AI helper (no external API) --------

app.post('/api/ai/assist', (req, res) => {
  const { prompt } = req.body || {};

  const lower = (prompt || '').toLowerCase();
  let suggestion;

  if (lower.includes('sqli') || lower.includes('sql')) {
    suggestion =
      "Try classic SQLi payloads like ' OR '1'='1 against /login and watch for 500 or SQL error messages.";
  } else {
    suggestion =
      "Focus on sending crafted input to /login and /search and look for 500 responses or SQL error strings to confirm injection.";
  }

  return res.json({
    suggestion,
    code: null
  });
});

// -------- Sandbox runner paths --------

const SANDBOX_DIR = 'C:/Users/parik/CyberSecurity/sandbox';
const RUNS_DIR = path.join(SANDBOX_DIR, 'runs');
const RUNNER_PATH = path.join(SANDBOX_DIR, 'runner.mjs');

// Ensure directories exist
async function ensureDirs() {
  await fs.mkdir(SANDBOX_DIR, { recursive: true });
  await fs.mkdir(RUNS_DIR, { recursive: true });
}

// Create or refresh runner.mjs that calls attack(target, http) and prints JSON
async function writeRunner() {
  const runner = `
    const target = JSON.parse(process.env.TARGET || '{"url":"http://host.docker.internal:3001/target"}');

    // Minimal HTTP helper using global fetch (Node 18+)
    const http = {
      async get(url, headers = {}) {
        const res = await fetch(url, { method: 'GET', headers });
        const text = await res.text();
        return { status: res.status, body: text };
      },
      async post(url, body, headers = {}) {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(body)
        });
        const text = await res.text();
        return { status: res.status, body: text };
      }
    };

    (async () => {
      try {
        const mod = await import(process.env.ATTACK_PATH || './runs/attack.mjs');
        if (!mod || typeof mod.attack !== 'function') {
          console.log(JSON.stringify({ error: 'No attack() export found' }));
          return;
        }
        const out = await mod.attack(target, http);
        console.log(JSON.stringify(out || {}));
      } catch (e) {
        console.log(JSON.stringify({ error: e && e.message ? e.message : String(e) }));
      }
    })();
  `;
  await fs.writeFile(RUNNER_PATH, runner, 'utf8');
}

// API: run submitted attack code in Docker
app.post('/api/lab/run', async (req, res) => {
  try {
    const { code, target, difficulty } = req.body || {};  // include difficulty
    await ensureDirs();
    await writeRunner();

    // Unique filename per run, use .mjs for ESM
    const stamp = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const attackRel = `runs/attack-${stamp}.mjs`;
    const attackAbs = path.join(SANDBOX_DIR, attackRel);

    // Save submitted code for this run
    await fs.writeFile(attackAbs, String(code || ''), 'utf8');

    // Build env for the container
    const effectiveTarget =
      target && target.url
        ? target
        : { url: 'http://host.docker.internal:3001/target' };

    const targetEnv = JSON.stringify(effectiveTarget).replace(/"/g, '\\"');
    const attackEnvPath = `/app/${attackRel.replace(/\\\\/g, '/').replace(/\\/g, '/')}`;

    // Docker command: mount whole sandbox, pass env, run runner.mjs
    const dockerCmd =
      `docker run --rm --memory="128m" --cpus="0.5" ` +
      `-e TARGET="${targetEnv}" ` +
      `-e ATTACK_PATH="${attackEnvPath}" ` +
      `-v "${SANDBOX_DIR}:/app" node:18-alpine node /app/runner.mjs`;

    // Add a hard timeout so requests don't hang (12s)
    exec(dockerCmd, { timeout: 12000 }, async (err, stdout, stderr) => {
      // Cleanup temp file regardless of outcome
      try { await fs.unlink(attackAbs); } catch {}

      if (err) {
        const msg = err.killed ? 'Timed out' : (stderr || err.message);
        return res.json({
          error: msg,
          logs: [{ level: 'error', msg: String(msg) }]
        });
      }

      let parsed = {};
      const rawOut = String(stdout || '').trim();
      try {
        parsed = rawOut ? JSON.parse(rawOut) : {};
      } catch {
        parsed = { raw: rawOut };
      }

      // -------- Core evaluation + DB logging --------
      const findingText = parsed.finding ? String(parsed.finding) : '';
      const status = findingText.toLowerCase().includes('sqli') ? 'success' : 'no_issue';

      const userId = null;

      db.run(
        'INSERT INTO runs (user_id, finding, payload, status, raw_json) VALUES (?, ?, ?, ?, ?)',
        [userId, findingText || null, parsed.payload || null, status, rawOut],
        (dbErr) => {
          if (dbErr) {
            console.error('Failed to insert run:', dbErr.message);
          }
        }
      );

      // -------- Difficulty-based tests --------
      const diff =
        typeof difficulty === 'string' ? difficulty.toLowerCase() : 'easy';
      const selectedTests = selectTestsForDifficulty(diff); // uses Array.filter under the hood [web:317][web:320]

      const tests = selectedTests.map((t) => ({
        id: t.id,
        difficulty: t.difficulty,
        title: t.title,
        description: t.description,
        passed: !!t.check(parsed)
      }));

      const score = tests.filter((t) => t.passed).length;
      // -------- end tests --------

      return res.json({
        ...parsed,
        status,
        difficulty: diff,
        tests,
        score,
        logs: [{ level: 'log', msg: rawOut.slice(0, 4000) }]
      });
    });
  } catch (e) {
    return res.json({ error: e.message || String(e) });
  }
});

// -------- Target simulator routes --------
const targetRouter = express.Router();

// GET /target/login?u=admin&p=<payload>
targetRouter.get('/login', (req, res) => {
  const { u = '', p = '' } = req.query;
  const lowered = String(p).toLowerCase();

  const sqli =
    lowered.includes("' or '1'='1") ||
    lowered.includes('union select') ||
    lowered.includes('sql');

  if (u === 'admin' && sqli) {
    return res.status(500).send('SQL syntax error near ...');
  }

  res.status(200).json({ ok: false, user: u, msg: 'Login failed' });
});

// GET /target/search?q=<term>
targetRouter.get('/search', (req, res) => {
  const { q = '' } = req.query;
  const l = String(q).toLowerCase();
  if (l.includes("'") || l.includes('"') || l.includes('--') || l.includes('union select')) {
    return res.status(500).send('DB error: unescaped input');
  }
  res.json({ ok: true, results: [], query: q });
});

// Optional helper to see traffic easily
targetRouter.get('/echo', (req, res) => {
  res.json({ method: 'GET', path: '/echo', query: req.query });
});

app.use('/target', targetRouter);
// -------- end target simulator --------

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running on port ${PORT}!`);
});
