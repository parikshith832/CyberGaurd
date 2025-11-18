Title
Sandbox security probes: run and report

Prerequisites

Sandbox shared folder mapped:

Sandbox path: C:\Users\WDAGUtilityAccount\Desktop\sandbox\host_backend_runs

Host path: C:\Users\parik\project\CyberSecurity\sandbox\host_backend_runs

Sandbox Python and files:

Python: C:\Users\WDAGUtilityAccount\Desktop\sandbox\py312\python.exe

Scripts: C:\Users\WDAGUtilityAccount\Desktop\work\target.py, client.py, start.ps1

How to run

In Windows Sandbox PowerShell:

Powershell -ExecutionPolicy Bypass -File C:\Users\WDAGUtilityAccount\Desktop\work\start.ps1

What the script does

Stops any process on port 8000, starts target.py, waits for readiness, runs client.py, prints KOK <run_path>, and may open the report.

Where results are saved (host)

C:\Users\parik\project\CyberSecurity\sandbox\host_backend_runs<timestamp>\report.html

C:\Users\parik\project\CyberSecurity\sandbox\host_backend_runs<timestamp>\summary.json

C:\Users\parik\project\CyberSecurity\sandbox\host_backend_runs<timestamp>\artifacts\results.jsonl

Expected results

XSS probes: status 200 with inert JSON payloads.

SQLi probes (GET/POST): status 403 with {"error":"blocked"}.

CSRF:

csrf-miss: 403 without X-CSRF header.

csrf-hit: 200 with X-CSRF: 1.

Troubleshooting

Script blocked by policy:

Powershell -ExecutionPolicy Bypass -File C:\Users\WDAGUtilityAccount\Desktop\work\start.ps1

Port busy:

Close prior Flask windows or reboot Sandbox, then rerun.

Files not visible on host:

Verify Sandbox path exists: Test-Path "$env:USERPROFILE\Desktop\sandbox\host_backend_runs"

Manually copy from the Sandbox-mapped folder on the host if needed.