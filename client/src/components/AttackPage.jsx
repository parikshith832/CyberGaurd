import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./attack-cyber.css";
import Editor from "@monaco-editor/react";

// Default attack script (JS) – returns structured JSON with http log
const defaultAttack = `// Red script: SQLi probe
// attack(target) receives { url } and http with get/post returning { status, body }
`;

const API_BASE = "http://localhost:3001";

const difficultyOptions = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Difficult" },
];

const AttackPage = () => {
  const [code, setCode] = useState(defaultAttack);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState([]);

  const [target, setTarget] = useState({
    url: "http://host.docker.internal:3001/target",
  });

  const [difficulty, setDifficulty] = useState("easy");
  const [allTests, setAllTests] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [questionScore, setQuestionScore] = useState(0);
  const [testsError, setTestsError] = useState("");

  const [aiInput, setAiInput] = useState(
    "Suggest SQLi payloads against a vulnerable login"
  );
  const [aiBusy, setAiBusy] = useState(false);

  const eventRef = useRef(null);
  const navigate = useNavigate();

  // Auto scroll console
  useEffect(() => {
    if (eventRef.current) {
      eventRef.current.scrollTop = eventRef.current.scrollHeight;
    }
  }, [events]);

  const addEvent = (e) =>
    setEvents((prev) => [...prev, { t: Date.now(), ...e }]);

  // ---- Random question helper ----
  const pickRandomQuestion = (tests, diff) => {
    if (!Array.isArray(tests) || tests.length === 0) {
      setCurrentQuestion(null);
      setCurrentQuestionId(null);
      return;
    }

    const targetLabel = diff === "medium" ? "moderate" : diff;

    const sameBand = tests.filter((t) =>
      String(t.difficulty || "")
        .toLowerCase()
        .includes(targetLabel)
    );

    const pool = sameBand.length > 0 ? sameBand : tests;
    const idx = Math.floor(Math.random() * pool.length);
    const q = pool[idx];

    setCurrentQuestion(q);
    setCurrentQuestionId(q.id);
    setQuestionScore(q && q.passed ? 1 : 0);
  };

  // ---- Load tests when difficulty changes ----
  const loadTestsForDifficulty = async (diff) => {
    setTestsError("");
    setAllTests([]);
    setCurrentQuestion(null);
    setCurrentQuestionId(null);
    setQuestionScore(0);

    try {
      const res = await fetch(
        `${API_BASE}/api/lab/tests?difficulty=${encodeURIComponent(diff)}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load tests");
      }

      const normalized = Array.isArray(data)
        ? data.map((t) => ({ ...t, passed: !!t.passed }))
        : [];

      setAllTests(normalized);
      pickRandomQuestion(normalized, diff);
      addEvent({
        level: "info",
        msg: `Loaded ${normalized.length} checks for ${diff} difficulty.`,
      });
    } catch (err) {
      console.error("Load tests error:", err);
      setTestsError(err.message || "Failed to load tests");
      addEvent({ level: "error", msg: err.message || "Failed to load tests" });
    }
  };

  useEffect(() => {
    loadTestsForDifficulty(difficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  // ---- Run attack script ----
  const runScript = async () => {
    setRunning(true);
    setResult(null);

    addEvent({
      level: "info",
      msg: `Running attack script (difficulty: ${difficulty})...`,
    });

    try {
      const res = await fetch(`${API_BASE}/api/lab/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, mode: "attack", target, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "run failed");

      setResult(data);

      if (data.logs) {
        data.logs.forEach((l) =>
          addEvent({ level: l.level || "log", msg: l.msg })
        );
      }
      if (data.finding) {
        addEvent({ level: "success", msg: `Finding: ${data.finding}` });
      }

      if (Array.isArray(data.tests)) {
        setAllTests(data.tests);
        if (currentQuestionId != null) {
          const updated = data.tests.find((t) => t.id === currentQuestionId);
          if (updated) {
            setCurrentQuestion(updated);
            const full = updated.points || 1;
            const earned =
              typeof updated.score === "number"
                ? updated.score
                : updated.passed
                ? full
                : 0;
            setQuestionScore(earned);
          }
        }
      }
    } catch (err) {
      console.error("Run script error:", err);
      addEvent({ level: "error", msg: err.message });
      alert("Error running script: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  const stopRun = () => {
    setRunning(false);
    addEvent({ level: "warn", msg: "Stopped." });
  };

  // ---- AI helper ----
  const askAI = async () => {
    setAiBusy(true);
    addEvent({ level: "info", msg: "AI agent thinking..." });
    try {
      const res = await fetch(`${API_BASE}/api/ai/assist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiInput,
          context: { mode: "attack", target, difficulty },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ai failed");
      if (data.code) {
        setCode(data.code);
        addEvent({
          level: "success",
          msg: "AI generated code inserted into editor.",
        });
      }
      if (data.suggestion) {
        addEvent({ level: "info", msg: `AI: ${data.suggestion}` });
      }
    } catch (e) {
      addEvent({ level: "error", msg: e.message });
    } finally {
      setAiBusy(false);
    }
  };

  const editorOptions = useMemo(
    () => ({
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: "expand",
      automaticLayout: true,
    }),
    []
  );

  const isLoggedIn = !!localStorage.getItem("token");

  // ---- Navigate to solution page for this question ----
  const goToSolution = () => {
    if (!currentQuestion || !currentQuestion.passed) return;

    navigate("/attack/solution", {
      state: {
        question: currentQuestion,
        difficulty,
        score: questionScore,
      },
    });
  };

  // ==========================
  // Login gate for Attack Lab
  // ==========================
  if (!isLoggedIn) {
    return (
      <main className="atk-viewport">
        <section className="atk-wrap">
          <div className="sim-card">
            <div className="card-head">
              <span className="chip">Attack Lab</span>
            </div>
            <div className="sim-body">
              <h2 className="question-title">Login required</h2>
              <p className="question-desc">
                You need to log in before accessing the Red Team Lab. This keeps
                your progress and scores linked to your account.
              </p>
              <button className="run" onClick={() => navigate("/login")}>
                Go to Login
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ==========================
  // Main lab UI (logged in)
  // ==========================
  return (
    <main className="atk-viewport">
      <div className="atk-beams" />
      <div className="atk-grid" />
      <div className="atk-grain" />

      <section className="atk-wrap">
        <header className="atk-head">
          <h1>Red Team Lab</h1>
          <div className="head-actions">
            <div className="target">
              <label>Target</label>
              <input
                value={target.url}
                onChange={(e) => setTarget({ ...target, url: e.target.value })}
              />
            </div>
            {currentQuestion && (
              <div className="question-meta">
                <span>
                  Marks: {questionScore} / {currentQuestion.points || 1}
                </span>
              </div>
            )}

            <div className="target">
              <label>Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {difficultyOptions.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <button className="run" disabled={running} onClick={runScript}>
              {running ? "Running..." : "Run"}
            </button>
            <button className="stop" onClick={stopRun}>
              Stop
            </button>
          </div>
        </header>

        <section className="atk-grid-2">
          {/* Left: editor + AI helper + inline console */}
          <div className="editor-card">
            <div className="card-head">
              <span className="chip">Attack Script</span>
            </div>
            <div className="editor-wrap">
              <Editor
                height="420px"
                defaultLanguage="javascript"
                value={code}
                onChange={(v) => setCode(v ?? "")}
                options={editorOptions}
                theme="vs-dark"
              />
            </div>

            <div className="ai-panel">
              <textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask the AI agent for payloads, scripts, or fixes..."
              />
              <button onClick={askAI} disabled={aiBusy}>
                {aiBusy ? "AI..." : "Ask AI"}
              </button>
            </div>

            <div className="console-inline">
              <div className="card-head">
                <span className="chip">Event Console</span>
              </div>
              <div className="console" ref={eventRef}>
                {events.map((e, i) => (
                  <div key={i} className={`evt ${e.level}`}>
                    <time>{new Date(e.t).toLocaleTimeString()}</time>
                    <span className="msg">{e.msg}</span>
                  </div>
                ))}
                {!events.length && <div className="muted">No events yet.</div>}
              </div>
            </div>
          </div>

          {/* Right: question + minimal info + output */}
          <div className="sim-card">
            <div className="card-head">
              <span className="chip">Target Simulator</span>
            </div>
            <div className="sim-body">
              {currentQuestion ? (
                <div className="question-panel">
                  <div className="question-tag">
                    {currentQuestion.passed ? "Completed" : "Current challenge"}
                  </div>
                  <div className="question-meta">
                    <span>
                      Difficulty:{" "}
                      {String(currentQuestion.difficulty || "").toUpperCase()}
                    </span>
                  </div>
                  <h2 className="question-title">
                    {currentQuestion.title || "Challenge"}
                  </h2>
                  {currentQuestion.description && (
                    <p className="question-desc">
                      {currentQuestion.description}
                    </p>
                  )}

                  {currentQuestion.passed && (
                    <button
                      className="run"
                      style={{ marginTop: "8px" }}
                      onClick={goToSolution}
                    >
                      View solution & score
                    </button>
                  )}
                </div>
              ) : (
                <div className="question-panel empty">
                  <div className="question-tag">Challenge</div>
                  <p className="question-desc">
                    Pick a difficulty; a random question from that band will
                    appear here.
                  </p>
                </div>
              )}

              {testsError && (
                <div className="lg-error" style={{ marginBottom: "6px" }}>
                  {testsError}
                </div>
              )}

              <div className="kv">
                <div>
                  <strong>Open Ports</strong>
                  <span>80, 443</span>
                </div>
                <div>
                  <strong>Tech Stack</strong>
                  <span>Node, Express, SQLite</span>
                </div>
                <div>
                  <strong>Flags</strong>
                  <span>{`flag{demo}`}</span>
                </div>
              </div>

              <div className="http-log">
                <div className="line head">
                  <span>M</span>
                  <span>Path</span>
                  <span>Status</span>
                </div>
                {result?.http?.map((h, i) => (
                  <div className="line" key={i}>
                    <span>{h.method}</span>
                    <span>{h.path}</span>
                    <span>{h.status}</span>
                  </div>
                ))}
                {!result?.http && (
                  <div className="muted">Run a script to see traffic...</div>
                )}
              </div>

              <div className="res-box">
                <strong>Result</strong>
                <pre>
                  {JSON.stringify(result ?? { info: "Waiting..." }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
};

export default AttackPage;
