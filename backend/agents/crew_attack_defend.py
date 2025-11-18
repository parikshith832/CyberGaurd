from pathlib import Path
from typing import Dict, Any, List
from crewai import Agent, Task, Crew, Process
import requests, time, json

REQ_TIMEOUT = 10
UA = {"User-Agent": "CyberSandbox-Prober/1.0"}

def _make_actions(target: str, tactics: List[str]) -> List[Dict[str, Any]]:
    actions: List[Dict[str, Any]] = []
    step = 1
    if "xss-probe" in tactics:
        actions.append({
            "step": step, "tactic": "xss-probe",
            "method": "GET", "path": "/",
            "param": "q", "payload": "<script>alert(1)</script>",
            "description": "Check for reflected XSS in a query parameter."
        }); step += 1
        actions.append({
            "step": step, "tactic": "xss-probe",
            "method": "GET", "path": "/",
            "param": "q", "payload": "hello-world",
            "description": "Benign control input to compare behavior."
        }); step += 1
    if "sqli-probe" in tactics:
        actions.append({
            "step": step, "tactic": "sqli-probe",
            "method": "GET", "path": "/",
            "param": "id", "payload": "' OR '1'='1",
            "description": "Basic boolean-based SQLi probe in a query parameter."
        }); step += 1
    return actions

def _do_request(method: str, url: str, params_or_data: Dict[str, Any], retries: int = 1):
    last_exc = None
    for i in range(retries + 1):
        try:
            if method == "GET":
                resp = requests.get(url, params=params_or_data, timeout=REQ_TIMEOUT, headers=UA)
            else:
                resp = requests.post(url, data=params_or_data, timeout=REQ_TIMEOUT, headers=UA)
            return resp
        except Exception as e:
            last_exc = e
            time.sleep(0.2)
    raise last_exc

def _execute_attacks(target: str, actions: List[Dict[str, Any]], artifacts_dir: Path) -> List[Dict[str, Any]]:
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    results: List[Dict[str, Any]] = []
    for a in actions:
        url = target.rstrip("/") + a.get("path", "/")
        t0 = time.time()
        try:
            if a["method"] == "GET":
                params = {a["param"]: a["payload"]}
                resp = _do_request("GET", url, params, retries=1)
                sent = {"method": "GET", "url": resp.request.url}
            elif a["method"] == "POST":
                data = {a["param"]: a["payload"]}
                resp = _do_request("POST", url, data, retries=1)
                sent = {"method": "POST", "url": url, "data": data}
            else:
                raise ValueError(f"Unsupported method: {a['method']}")
            elapsed = time.time() - t0

            text = (resp.text or "")
            body = text.lower()[:10000]
            payload_lower = str(a["payload"]).lower()
            reflected = payload_lower in body
            status = resp.status_code
            server_error = 500 <= status < 600

            sqli_err_markers = [
                "sql syntax", "mysql", "mariadb", "postgresql", "psql",
                "pg_query", "sqlite", "odbc", "unclosed quotation", "fatal error"
            ]
            sqli_error = any(m in body for m in sqli_err_markers)

            success = False
            if a["tactic"] == "xss-probe":
                success = not reflected and not server_error
            elif a["tactic"] == "sqli-probe":
                success = not server_error and not sqli_error

            blockish_codes = {401, 403, 406, 409, 415, 422}
            blocked_code = status in blockish_codes

            rec = {
                "step": a["step"],
                "tactic": a["tactic"],
                "request": sent,
                "status": status,
                "elapsed_ms": int(elapsed * 1000),
                "reflected": reflected,
                "server_error": server_error,
                "sqli_error": sqli_error if a["tactic"] == "sqli-probe" else False,
                "blocked_code": blocked_code,
                "success": success,
                "note": a["description"],
            }
        except Exception as e:
            rec = {
                "step": a["step"],
                "tactic": a["tactic"],
                "request": {"error": str(e), "url": url},
                "status": None,
                "elapsed_ms": None,
                "reflected": False,
                "server_error": False,
                "sqli_error": False,
                "blocked_code": False,
                "success": False,
                "note": f"Request failed: {e}",
            }
        results.append(rec)

    out_path = artifacts_dir / "results.jsonl"
    with out_path.open("w", encoding="utf-8") as f:
        for r in results:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    return results

def _score(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not results:
        return {"asr": 0.0, "block_rate": 0.0}
    successes = sum(1 for r in results if r["success"])
    blocks = 0
    for r in results:
        if r["blocked_code"]:
            blocks += 1
        if r["tactic"] == "xss-probe" and r["success"]:
            blocks += 1
    asr = successes / len(results)
    block_rate = min(1.0, blocks / max(1, len(results)))
    return {"asr": round(asr, 3), "block_rate": round(block_rate, 3)}

def run_attack_defend(scenario: Dict[str, Any], out_dir: Path) -> Dict[str, Any]:
    target = scenario.get("target", "http://localhost:8000")
    tactics = scenario.get("tactics", ["xss-probe", "sqli-probe"])
    limits = scenario.get("limits", {"max_steps": 5})

    attacker = Agent(
        role="Offensive Security Attacker",
        goal="Devise and execute concrete attack steps against the target.",
        backstory="Acts as a red-team operator producing actions and expected signals.",
        verbose=False,
        allow_delegation=False,
    )
    defender = Agent(
        role="Defense Analyst",
        goal="Evaluate outcomes, estimate detections/blocks, and compute a score.",
        backstory="Parses artifacts and provides detection/mitigation guidance.",
        verbose=False,
        allow_delegation=False,
    )

    actions = _make_actions(target, tactics)
    (out_dir / "plan.json").write_text(
        json.dumps({"target": target, "tactics": tactics, "limits": limits, "actions": actions}, indent=2),
        encoding="utf-8"
    )

    artifacts_dir = out_dir / "artifacts"
    results = _execute_attacks(target, actions, artifacts_dir)

    scores = _score(results)
    summary = {"target": target, "tactics": tactics, "limits": limits, **scores}
    (out_dir / "detections.json").write_text(json.dumps({"results": results}, indent=2), encoding="utf-8")
    return summary
