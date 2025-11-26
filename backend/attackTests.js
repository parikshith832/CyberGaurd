// backend/attackTests.js

// out = parsed JSON from the sandbox: { finding, payload, http, ... }
// Your attack() can also return a custom `requests` array; we treat that
// as a fallback if `http` is not present.

function getHttpLogs(out) {
  if (!out) return [];
  if (Array.isArray(out.http)) return out.http;

  // Fallback: if attack() returns `requests` instead of `http`
  if (Array.isArray(out.requests)) {
    return out.requests.map((r) => {
      let path = r.path || "";
      try {
        if (!path && typeof r.url === "string") {
          path = new URL(r.url).pathname;
        }
      } catch {
        // ignore URL parse errors
      }
      return {
        method: r.method,
        path,
        status: r.status,
      };
    });
  }

  return [];
}

function easyTests() {
  return [
    {
      id: 1,
      difficulty: "easy",
      title: "Detect basic SQLi on /login",
      description:
        "Send at least one SQLi payload to /login that causes a 500 with SQL error text and report it in finding.",
      points: 10,
      check(out) {
        const http = getHttpLogs(out);

        const has500Login = http.some(
          (h) =>
            String(h.path || "").startsWith("/login") &&
            Number(h.status) === 500
        );

        const finding =
          typeof out.finding === "string" ? out.finding.toLowerCase() : "";
        const mentionsSQLi =
          finding.includes("sqli") ||
          finding.includes("sql injection") ||
          finding.includes("possible sqli");

        // Full points only if they actually triggered the DB error AND reported it.
        return has500Login && mentionsSQLi ? 10 : 0;
      },
    },
    {
      id: 2,
      difficulty: "easy",
      title: "Use at least one SQLi-style payload",
      description:
        "Use a classic SQLi payload such as ' OR '1'='1 or UNION SELECT in the attack code.",
      points: 5,
      check(out) {
        const payload = String(out.payload || "");
        const lower = payload.toLowerCase();

        const hasClassic =
          payload.includes("' OR '1'='1") || lower.includes("union select");

        // Also accept if payload appears only in finding text
        const finding =
          typeof out.finding === "string" ? out.finding.toLowerCase() : "";
        const findingHasClassic =
          finding.includes("' or '1'='1") || finding.includes("union select");

        return hasClassic || findingHasClassic ? 5 : 0;
      },
    },
    {
      id: 3,
      difficulty: "easy",
      title: "Log at least one HTTP request",
      description:
        "Use the provided http helper to perform at least one real request (no static output).",
      points: 5,
      check(out) {
        const http = getHttpLogs(out);

        // Require at least one real-looking entry
        const hasRequest = http.some(
          (h) => h && h.method && h.path && typeof h.status !== "undefined"
        );

        return hasRequest ? 5 : 0;
      },
    },
  ];
}

function moderateTests() {
  return [
    {
      id: 4,
      difficulty: "moderate",
      title: "Probe /search for SQLi",
      description:
        "Send at least one payload to /search that triggers a 500 DB error.",
      points: 10,
      check(out) {
        const http = getHttpLogs(out);
        const has500Search = http.some(
          (h) =>
            String(h.path || "").startsWith("/search") &&
            Number(h.status) === 500
        );
        return has500Search ? 10 : 0;
      },
    },
    {
      id: 5,
      difficulty: "moderate",
      title: "Try multiple payloads",
      description:
        "Loop through at least three different payloads instead of a single hard-coded one.",
      points: 5,
      check(out) {
        const http = getHttpLogs(out);
        const uniquePaths = new Set(http.map((h) => h.path));
        return uniquePaths.size >= 3 ? 5 : 0;
      },
    },
  ];
}

function hardTests() {
  return [
    {
      id: 6,
      difficulty: "hard",
      title: "Attack multiple endpoints in one script",
      description:
        "Target both /login and /search at least once and aggregate the findings.",
      points: 10,
      check(out) {
        const http = getHttpLogs(out);
        const hitLogin = http.some((h) =>
          String(h.path || "").startsWith("/login")
        );
        const hitSearch = http.some((h) =>
          String(h.path || "").startsWith("/search")
        );
        return hitLogin && hitSearch ? 10 : 0;
      },
    },
    {
      id: 7,
      difficulty: "hard",
      title: "Use less obvious SQLi payloads",
      description:
        "Trigger a SQL error using a payload other than the classic ' OR '1'='1.",
      points: 10,
      check(out) {
        const payload = String(out.payload || "");
        const lower = payload.toLowerCase();

        const isClassic = payload.includes("' OR '1'='1");
        const looksSQLi =
          lower.includes("union select") ||
          lower.includes("or 1=1") ||
          lower.includes("or true");

        return !isClassic && looksSQLi ? 10 : 0;
      },
    },
  ];
}

// Difficulty comes in as "easy", "moderate", or "hard" (lowercase)
function selectTestsForDifficulty(diff) {
  const d = (diff || "easy").toLowerCase();
  if (d === "easy") return easyTests();
  if (d === "moderate") return moderateTests();
  if (d === "hard") return hardTests();
  return easyTests();
}

// Optional helper: some server code may call this to show test metadata
function getTestsForDifficulty(diff) {
  const tests = selectTestsForDifficulty(diff);
  return tests.map(({ check, ...meta }) => meta);
}

module.exports = {
  selectTestsForDifficulty,
  getTestsForDifficulty,
};
