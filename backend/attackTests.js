// attackTests.js
// Question bank + helper to select tests by difficulty

const ATTACK_TESTS = [
  // ---------- EASY (5) ----------
  {
    id: 'easy-sqli-login',
    difficulty: 'easy',
    title: 'Detect basic SQLi on /login',
    description:
      'Flag SQL injection when a classic OR 1=1 payload against /login causes a 500 with SQL error text.',
    check: (result) => {
      if (!result || !Array.isArray(result.http)) return false;
      const finding = String(result.finding || '').toLowerCase();
      const hasLogin500 = result.http.some(
        (h) =>
          h &&
          typeof h.path === 'string' &&
          h.path.includes('/login') &&
          h.status === 500
      );
      return finding.includes('sqli') && hasLogin500;
    }
  },
  {
    id: 'easy-payload-used',
    difficulty: 'easy',
    title: 'Use at least one SQLi-style payload',
    description:
      "Try a payload such as ' OR '1'='1 or UNION SELECT in the attack code.",
    check: (result) => {
      const payload = String(result.payload || '').toLowerCase();
      return (
        payload.includes("' or '1'='1") ||
        payload.includes('" or "1"="1') ||
        payload.includes('union select') ||
        payload.includes(' or 1=1')
      );
    }
  },
  {
    id: 'easy-logs-present',
    difficulty: 'easy',
    title: 'Log at least one HTTP request',
    description:
      'Record at least one HTTP request in the http array for observability.',
    check: (result) => Array.isArray(result.http) && result.http.length >= 1
  },
  {
    id: 'easy-no-crash',
    difficulty: 'easy',
    title: 'Return structured JSON without crashing',
    description:
      'Return an object with finding and http fields (no top-level error).',
    check: (result) =>
      !!result &&
      typeof result === 'object' &&
      'finding' in result &&
      'http' in result &&
      !result.error
  },
  {
    id: 'easy-no-issue-status',
    difficulty: 'easy',
    title: 'Report "no_issue" when nothing looks vulnerable',
    description:
      'If no 500 or SQL error messages occur, status should be no_issue, not success.',
    check: (result) => {
      if (!result || !Array.isArray(result.http)) return false;
      const any500 = result.http.some((h) => h && h.status === 500);
      if (any500) return true; // not applicable, they actually found an issue
      return result.status === 'no_issue';
    }
  },

  // ---------- MODERATE (3) ----------
  {
    id: 'mod-search-sqli',
    difficulty: 'moderate',
    title: 'Probe /search for SQLi',
    description:
      'Send at least one payload to /search that triggers a 500 DB error.',
    check: (result) => {
      if (!result || !Array.isArray(result.http)) return false;
      return result.http.some(
        (h) =>
          h &&
          typeof h.path === 'string' &&
          h.path.includes('/search') &&
          h.status === 500
      );
    }
  },
  {
    id: 'mod-multiple-payloads',
    difficulty: 'moderate',
    title: 'Try multiple payloads',
    description:
      'Loop through at least three different payloads to increase coverage.',
    check: (result) => {
      if (!result || !Array.isArray(result.http)) return false;
      return result.http.length >= 3;
    }
  },
  {
    id: 'mod-body-based-detection',
    difficulty: 'moderate',
    title: 'Detect SQLi from error text as well as status code',
    description:
      'If status is 200 but body contains SQL error keywords, still classify as Possible SQLi.',
    check: (result) => {
      const finding = String(result.finding || '').toLowerCase();
      const bodyErrors =
        Array.isArray(result.logs) &&
        result.logs.some((l) =>
          String(l.msg || '')
            .toLowerCase()
            .includes('sql')
        );
      return finding.includes('sqli') && bodyErrors;
    }
  },

  // ---------- HARD (2) ----------
  {
    id: 'hard-multi-endpoint-strategy',
    difficulty: 'hard',
    title: 'Attack multiple endpoints in one script',
    description:
      'Probe both /login and /search and aggregate findings in one result object.',
    check: (result) => {
      if (!result || !Array.isArray(result.http)) return false;
      const hitLogin = result.http.some(
        (h) => h && typeof h.path === 'string' && h.path.includes('/login')
      );
      const hitSearch = result.http.some(
        (h) => h && typeof h.path === 'string' && h.path.includes('/search')
      );
      return hitLogin && hitSearch;
    }
  },
  {
    id: 'hard-stealthy-payload',
    difficulty: 'hard',
    title: 'Use less obvious SQLi payloads',
    description:
      "Cause a SQL error using payloads other than the classic ' OR '1'='1.",
    check: (result) => {
      if (!result || !Array.isArray(result.http)) return false;
      const payload = String(result.payload || '').toLowerCase();
      const usedClassic = payload.includes("' or '1'='1");
      const has500 = result.http.some((h) => h && h.status === 500);
      return has500 && !usedClassic;
    }
  }
];

function selectTestsForDifficulty(difficulty) {
  if (difficulty === 'moderate') {
    return ATTACK_TESTS.filter(
      (t) => t.difficulty === 'easy' || t.difficulty === 'moderate'
    );
  }
  if (difficulty === 'hard') {
    return ATTACK_TESTS;
  }
  return ATTACK_TESTS.filter((t) => t.difficulty === 'easy');
}

module.exports = {
  ATTACK_TESTS,
  selectTestsForDifficulty
};
