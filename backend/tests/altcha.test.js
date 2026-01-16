/* eslint-disable no-undef */

// These tests assume the backend Strapi server is running on http://localhost:1337
// They perform POST requests to /api/messages to verify the ALTCHA middleware and honeypot

jest.setTimeout(20000);

describe('ALTCHA middleware', () => {
  const base = 'http://localhost:1337';

  test('rejects request without ALTCHA verification', async () => {
    const res = await fetch(`${base}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        data: { nombre: 'Test User', email: 'test@example.com', consulta: 'no altcha' } 
      }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty('error');
    expect(json.error.message).toMatch(/ALTCHA verification is missing/i);
  });

  test('rejects request with invalid ALTCHA payload', async () => {
    const res = await fetch(`${base}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        data: { nombre: 'Test User', email: 'test@example.com', consulta: 'fake altcha' }, 
        altcha: 'FAKE_PAYLOAD' 
      }),
    });

    // Should return 400 (Invalid ALTCHA) or 500 (if ALTCHA not configured)
    expect([400, 500]).toContain(res.status);
    const json = await res.json();
    expect(json).toHaveProperty('error');
  });

  test('challenge endpoint returns valid challenge', async () => {
    const res = await fetch(`${base}/api/altcha/challenge`, {
      method: 'GET',
    });

    // Should return 200 with challenge data, or 500 if not configured
    if (res.status === 200) {
      const json = await res.json();
      expect(json).toHaveProperty('challenge');
      expect(json).toHaveProperty('salt');
      expect(json).toHaveProperty('algorithm');
      expect(json).toHaveProperty('signature');
      expect(json.algorithm).toBe('SHA-256');
    } else {
      // 500 is acceptable if ALTCHA_HMAC_KEY is not configured
      expect(res.status).toBe(500);
    }
  });
});

describe('Honeypot protection', () => {
  const base = 'http://localhost:1337';

  test('rejects request with honeypot field filled', async () => {
    const res = await fetch(`${base}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        data: { nombre: 'Test Bot', email: 'bot@example.com', consulta: 'bot test' },
        website: 'http://spam.com', // Honeypot field filled - likely a bot
        altcha: 'FAKE_PAYLOAD'
      }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty('error');
    // The error message should indicate verification failed (we don't reveal it's the honeypot)
    expect(json.error.message).toMatch(/Verification failed/i);
  });
});

