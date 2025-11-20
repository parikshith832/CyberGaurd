// server.js - final version for local project
// - Auth with SQLite (users table)
// - Run logs in SQLite (runs table)
// - Gemini AI helper (with safe mock / fallback)
// - Local SQLi target simulator + Docker sandbox runner

require('dotenv').config(); // loads .env into process.env

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('./db');
const { selectTestsForDifficulty } = require('./attackTests');

// ---------------------------------------------------------------------
// Gemini AI client setup
// ---------------------------------------------------------------------

let genAI = null;

try {
  if (process.env.GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Gemini client initialized');
  } else if (String(process.env.DEV_MOCK_AI).toLowerCase() === 'true') {
    console.warn('DEV_MOCK_AI enabled — using mock AI for /api/ai/assist');
    genAI = {
      getGenerativeModel() {
        return {
          async generateContent(_prompt) {
            return {
              response: {
                text: () =>
                  'Mock AI: Gemini unavailable or API key missing. Enable GEMINI_API_KEY for real responses.'
              }
            };
          }
        };
      }
    };
  } else {
    console.warn(
      'Gemini client not configured and DEV_MOCK_AI not enabled. /api/ai/assist will be unavailable.'
    );
  }
} catch (e) {
  console.error('Error initializing Gemini client:', e && e.message);
}

// ---------------------------------------------------------------------
// Express + globals
// ---------------------------------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-super-secret'; // change for real use

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------
// Auth routes (register + login)
// ---------------------------------------------------------------------

// POST /api/auth/register  { username, password }
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  try {
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
  } catch (e) {
    console.error('Register exception:', e.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login  { username, password }
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

// Simple auth middleware (for future use if you want user‑bound runs)
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ---------------------------------------------------------------------
// AI helper using Gemini
// ---------------------------------------------------------------------

// POST /api/ai/assist  { prompt?, context? }
app.post('/api/ai/assist', async (req, res) => {
  try {
    const { prompt, context } = req.body || {};

    const basePrompt =
      prompt && prompt.trim().length > 0
        ? prompt
        : 'Suggest SQL injection lab payloads or hints for a beginner.';

    const userText =
      `${basePrompt}\n\n` +
      `Lab context: ${JSON.stringify(context || {}, null, 2)}\n\n` +
      'Keep answers short and focused on educational SQLi hints, not real-world exploitation.';

    if (!genAI) {
      return res.status(503).json({
        error: 'AI unavailable',
        message:
          'No AI client configured. Set GEMINI_API_KEY for real responses or set DEV_MOCK_AI=true for local testing.'
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(userText);
    const response = result.response;
    const suggestion =
      response && typeof response.text === 'function'
        ? response.text().trim()
        : String(response || '').trim();

    res.json({ suggestion, code: null });
  } catch (err) {
    console.error('Gemini AI assist error:', err.message);
    res.status(500).json({ error: 'AI assistant error' });
  }
});

// ---------------------------------------------------------------------
// Sandbox runner configuration
// ---------------------------------------------------------------------

const SANDBOX_DIR = 'C:/Users/parik/CyberSecurity/sandbox';
const RUNS_DIR = path.join(SANDBOX_DIR, 'runs');
const RUNNER_PATH = path.join(SANDBOX_DIR, 'runner.mjs');

async function ensureDirs() {
  await fs.mkdir(SANDBOX_DIR, { recursive: true });
  await fs.mkdir(RUNS_DIR, { recursive: true });
}

// Writes runner.mjs that imports ATTACK_PATH and calls attack(target, http)
async function writeRunner() {
  const runner = `
    const target = JSON.parse(process.env.TARGET || '{"url":"http://host.docker.internal:3001/target"}');

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

// ---------------------------------------------------------------------
// API: run submitted attack code in Docker
// ---------------------------------------------------------------------

// POST /api/lab/run  { code, target?, difficulty? }
app.post('/api/lab/run', async (req, res) => {
  try {
    const { code, target, difficulty } = req.body || {};
    await ensureDirs();
    await writeRunner();

    const stamp = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const attackRel = `runs/attack-${stamp}.mjs`;
    const attackAbs = path.join(SANDBOX_DIR, attackRel);

    await fs.writeFile(attackAbs, String(code || ''), 'utf8');

    const effectiveTarget =
      target && target.url
        ? target
        : { url: 'http://host.docker.internal:3001/target' };

    const targetEnv = JSON.stringify(effectiveTarget).replace(/"/g, '\\"');
    const attackEnvPath = `/app/${attackRel.replace(/\\\\/g, '/').replace(/\\/g, '/')}`;

    const dockerCmd =
      `docker run --rm --memory="128m" --cpus="0.5" ` +
      `-e TARGET="${targetEnv}" ` +
      `-e ATTACK_PATH="${attackEnvPath}" ` +
      `-v "${SANDBOX_DIR}:/app" node:18-alpine node /app/runner.mjs`;

    exec(dockerCmd, { timeout: 12000 }, async (err, stdout, stderr) => {
      try {
        await fs.unlink(attackAbs);
      } catch {
        // ignore
      }

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

      const findingText = parsed.finding ? String(parsed.finding) : '';
      const status = findingText.toLowerCase().includes('sqli')
        ? 'success'
        : 'no_issue';

      // For now, runs are anonymous; wire auth() here if you want per‑user logs
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

      const diff =
        typeof difficulty === 'string' ? difficulty.toLowerCase() : 'easy';
      const selectedTests = selectTestsForDifficulty(diff);

      const tests = selectedTests.map((t) => ({
        id: t.id,
        difficulty: t.difficulty,
        title: t.title,
        description: t.description,
        passed: !!t.check(parsed)
      }));

      const score = tests.filter((t) => t.passed).length;

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
    console.error('Lab run error:', e.message);
    return res.json({ error: e.message || String(e) });
  }
});

// ---------------------------------------------------------------------
// Target simulator routes (fake vulnerable app)
// ---------------------------------------------------------------------

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

  if (
    l.includes("'") ||
    l.includes('"') ||
    l.includes('--') ||
    l.includes('union select')
  ) {
    return res.status(500).send('DB error: unescaped input');
  }

  res.json({ ok: true, results: [], query: q });
});

// Helper to see traffic
targetRouter.get('/echo', (req, res) => {
  res.json({ method: 'GET', path: '/echo', query: req.query });
});

app.use('/target', targetRouter);

// ---------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running on port ${PORT}!`);
});
