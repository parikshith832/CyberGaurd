from flask import Flask, request, jsonify
from pathlib import Path
from datetime import datetime
import uuid, json, traceback

from agents.crew_attack_defend import run_attack_defend

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
RUNS_DIR = BASE_DIR / "runs"
RUNS_DIR.mkdir(parents=True, exist_ok=True)

@app.route("/api/runScenario", methods=["POST"])
def run_scenario():
    try:
        body = request.get_json(force=True) or {}
        run_id = f"{datetime.utcnow().strftime('%Y%m%dT%H%M%S')}_{uuid.uuid4().hex[:8]}"
        out_dir = RUNS_DIR / run_id
        out_dir.mkdir(parents=True, exist_ok=True)

        result = run_attack_defend(body, out_dir)

        # Save a summary JSON for the dashboard
        (out_dir / "summary.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
        return jsonify({"runId": run_id, "result": result}), 200
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/api/runResult/<run_id>", methods=["GET"])
def run_result(run_id):
    p = RUNS_DIR / run_id / "summary.json"
    if not p.exists():
        return jsonify({"error": "not found"}), 404
    return jsonify(json.loads(p.read_text(encoding="utf-8")))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)
