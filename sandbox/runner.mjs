
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
  