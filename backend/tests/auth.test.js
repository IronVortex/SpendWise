const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test('Auth API: User Registration and Login Flow', async (t) => {
  const testEmail = `fintech_user_${Date.now()}@test.com`;
  const testPassword = 'Password@1234';

  await t.test('POST /api/auth/register creates a new user and returns JWT token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Finch',
        email: testEmail,
        password: testPassword
      })
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.email, testEmail);
    assert.equal(data.user.passwordHash, undefined); // never leak hash
  });

  await t.test('POST /api/auth/register rejects duplicate email', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Finch Clone',
        email: testEmail,
        password: testPassword
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /already exists/i);
  });

  await t.test('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.name, 'Jordan Finch');
  });

  await t.test('POST /api/auth/login rejects invalid password', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword999'
      })
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /invalid email or password/i);
  });

  await t.test('Pre-seeded demo user (demo@spendsense.com) can log in', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@spendsense.com',
        password: 'SpendSense@123'
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.name, 'Alex Taylor');
  });
});

test('Auth API: Protected Profile and Password Recovery', async (t) => {
  // Login first to get token
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'demo@spendsense.com',
      password: 'SpendSense@123'
    })
  });
  const { token } = await loginRes.json();

  await t.test('GET /api/auth/me returns authenticated user with valid Bearer token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.email, 'demo@spendsense.com');
  });

  await t.test('GET /api/auth/me rejects request without token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(res.status, 401);
  });

  await t.test('POST /api/auth/forgot-password produces recovery token with development instructions', async () => {
    const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@spendsense.com' })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.devResetToken);
  });
});
