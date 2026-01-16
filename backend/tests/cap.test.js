/* eslint-disable no-undef */

// These tests assume the backend Strapi server is running on http://localhost:1337
// They perform two POST requests to /api/messages to verify the Cap middleware

jest.setTimeout(20000);

describe('Cap middleware', () => {
  const base = 'http://localhost:1337';

  test('rejects request without cap token', async () => {
    const res = await fetch(`${base}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { nombre: 'Test Bot', email: 'bot@example.com', consulta: 'no token' } }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty('error');
    expect(json.error.message).toMatch(/Cap token is missing/i);
  });

  test('rejects request with invalid cap token', async () => {
    const res = await fetch(`${base}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { nombre: 'Test Bot', email: 'bot@example.com', consulta: 'fake token' }, capToken: 'FAKE_TOKEN' }),
    });

    // Should return 400 (Invalid Cap token) or 500 (if Cap server not configured)
    expect([400, 500]).toContain(res.status);
    const json = await res.json();
    expect(json).toHaveProperty('error');
  });
});

