const http = require('http');

(async () => {
  try {
    const body = JSON.stringify({ prompt: 'test', context: {} });

    const opts = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/ai/assist',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.suggestion && String(json.suggestion).toLowerCase().includes('mock ai')) {
            console.log('AI assist mock test: PASS');
            process.exit(0);
          }
          console.error('AI assist mock test: FAIL - unexpected response', json);
          process.exit(2);
        } catch (e) {
          console.error('AI assist mock test: FAIL - invalid JSON', data);
          process.exit(2);
        }
      });
    });

    req.on('error', (e) => {
      console.error('AI assist mock test: FAIL - request error', e && e.message);
      process.exit(2);
    });

    req.write(body);
    req.end();
  } catch (e) {
    console.error('AI assist mock test: ERROR', e && e.message);
    process.exit(2);
  }
})();
