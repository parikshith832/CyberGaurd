import React, { useEffect, useMemo, useRef, useState } from "react";
import "./attack-cyber.css";
import Editor from "@monaco-editor/react";

// Default attack script (JS) – returns structured JSON with http log
const defaultAttack = `// Red script: SQLi probe
// attack(target) receives { url } and http with get/post returning { status, body }
export async function attack(target, http) {
  const payloads = ["' '1'='1", "' UNION SELECT null--", "'; DROP TABLE users;--"];
  const httpLog = [];

  const pushLog = (method, path, status) => httpLog.push({ method, path, status });

  for (const p of payloads) {
    const path = "/login?u=admin&p=" + encodeURIComponent(p);
    const url = target.url.replace(/\\/$/, "") + path;
    const res = await http.get(url);
    pushLog("GET", path, res.status);

    const bodyLower = String(res.body || "").toLowerCase();
    if (res.status === 500 || bodyLower.includes("sql")) {
      return { finding: "Possible SQLi", payload: p, http: httpLog };
    }
  }

  return { finding: "No obvious SQLi", http: httpLog };
}
`;

const AttackPage = () => {
  // Attack-only mode: no defense UI/state
  const [code, setCode] = useState(defaultAttack);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState([]);
  // Use host.docker.internal so scripts executed inside Docker can reach your host API
  const [target, setTarget] = useState({
    url: "http://host.docker.internal:3001/target",
  });
  const [difficulty, setDifficulty] = useState("easy"); // easy | moderate | difficult
  const [aiInput, setAiInput] = useState(
    "Suggest SQLi payloads against a vulnerable login"
  );
  const [aiBusy, setAiBusy] = useState(false);
  const eventRef = useRef(null);

  // Auto scroll console
  useEffect(() => {
    if (eventRef.current) {
      eventRef.current.scrollTop = eventRef.current.scrollHeight;
    }
  }, [events]);

  const addEvent = (e) =>
    setEvents((prev) => [...prev, { t: Date.now(), ...e }]);

  const runScript = async () => {
    console.log("Run button clicked");
    setRunning(true);
    setResult(null);
    addEvent({
      level: "info",
      msg: `Running attack script (difficulty: ${difficulty})...`,
    });
    try {
      const res = await fetch("http://localhost:3001/api/lab/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, mode: "attack", target, difficulty }),
      });
      console.log("Response status:", res.status);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "run failed");
      console.log("Response data:", data);
      setResult(data);
      if (data.logs)
        data.logs.forEach((l) =>
          addEvent({ level: l.level || "log", msg: l.msg })
        );
      if (data.finding)
        addEvent({ level: "success", msg: `Finding: ${data.finding}` });
    } catch (err) {
      console.error(err);
      addEvent({ level: "error", msg: err.message });
      alert("Error running script: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  const stopRun = async () => {
    setRunning(false);
    addEvent({ level: "warn", msg: "Stopped." });
  };

  const askAI = async () => {
    setAiBusy(true);
    addEvent({ level: "info", msg: "AI agent thinking..." });
    try {
      const res = await fetch("http://localhost:3001/api/ai/assist", {
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

            <div className="target">
              <label>Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="difficult">Difficult</option>
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
          </div>

          <div className="sim-card">
            <div className="card-head">
              <span className="chip">Target Simulator</span>
            </div>
            <div className="sim-body">
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

          <div className="console-card">
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
        </section>
      </section>
    </main>
  );
};

export default AttackPage;
