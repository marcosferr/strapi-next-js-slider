/* eslint-disable no-undef */

// These tests assume the backend Strapi server is running on http://localhost:1337
// They perform two POST requests to /api/messages to verify the recaptcha middleware

jest.setTimeout(20000);

describe('Recaptcha middleware', () => {
  const base = 'http://localhost:1337';

  test('rejects request without recaptcha token', async () => {
    const res = await fetch(`${base}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { nombre: 'Test Bot', email: 'bot@example.com', consulta: 'no token' } }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty('error');
    expect(json.error.message).toMatch(/Recaptcha token is missing/i);
  });

  test('rejects request with invalid recaptcha token', async () => {
    const res = await fetch(`${base}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { nombre: 'Test Bot', email: 'bot@example.com', consulta: 'fake token' }, recaptchaToken: 'FAKE_TOKEN' }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty('error');
    // message could be 'Invalid Recaptcha' and details may contain 'invalid-input-response'
    expect(json.error.message).toMatch(/Invalid Recaptcha/i);
    expect(json.error.details).toBeDefined();
  });
});
