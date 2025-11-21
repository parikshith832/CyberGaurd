import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./attack-cyber.css";

const AttackSolutionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const { question, difficulty, score } = state;

  if (!question) {
    return (
      <main className="atk-viewport">
        <section className="atk-wrap">
          <h1>Challenge details unavailable</h1>
          <p>
            No question data was provided. Go back to the Attack lab and run a
            challenge again.
          </p>
          <button className="run" onClick={() => navigate("/attack")}>
            Back to Attack lab
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="atk-viewport">
      <section className="atk-wrap">
        <h1>Challenge Summary</h1>

        <div className="sim-card" style={{ marginTop: "16px" }}>
          <div className="card-head">
            <span className="chip">Problem Details</span>
          </div>
          <div className="sim-body">
            <div className="question-panel">
              <div className="question-tag">Completed</div>
              <div className="question-meta">
                <span>
                  Difficulty:{" "}
                  {String(question.difficulty || difficulty).toUpperCase()}
                </span>
              </div>
              <h2 className="question-title">
                {question.title || "Challenge"}
              </h2>
              {question.description && (
                <p className="question-desc">{question.description}</p>
              )}
            </div>

            <div className="res-box" style={{ marginTop: "10px" }}>
              <strong>Score for this problem</strong>
              <pre>
                {JSON.stringify(
                  {
                    score: score ?? 1,
                    passed: question.passed === true,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <button
              className="run"
              style={{ marginTop: "12px" }}
              onClick={() => navigate("/attack")}
            >
              Back to Red Team Lab
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AttackSolutionPage;
