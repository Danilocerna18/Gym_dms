const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { test } = require('node:test');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const nodemailer = require('nodemailer');

test('Recuperación con transporte Nodemailer simulado', async () => {
  Object.assign(process.env, {
    SMTP_HOST: 'smtp.gmail.com', SMTP_PORT: '465', SMTP_USER: 'smtp@example.invalid',
    SMTP_PASSWORD: 'test', RESET_MAIL_FROM: 'GymSync <smtp@example.invalid>',
    FRONTEND_URL: 'http://localhost:4200',
  });
  const messages = [];
  const jsonTransport = nodemailer.createTransport({ jsonTransport: true });
  let rejectDelivery = false;
  nodemailer.createTransport = options => {
    assert.equal(options.secure, true);
    assert.equal(options.host, 'smtp.gmail.com');
    assert.equal(options.port, 465);
    return { sendMail: async mail => {
      if (rejectDelivery) throw Object.assign(new Error(), { code: 'EAUTH' });
      messages.push(JSON.parse((await jsonTransport.sendMail(mail)).message));
    }};
  };

  const user = { id: 'member', name: 'Miembro', email: 'member@example.invalid', role: 'member', passwordHash: 'old' };
  let reset;
  const matches = ({ tokenHash, expiresAt }) => reset && tokenHash === reset.tokenHash &&
    (!expiresAt || reset.expiresAt > expiresAt.gt);
  const db = {
    user: {
      findFirst: async ({ where }) => where.email.equals === user.email ? user : null,
      update: async ({ data }) => Object.assign(user, data),
    },
    passwordReset: {
      findUnique: async ({ where }) => matches(where) ? reset : null,
      count: async ({ where }) => matches(where) ? 1 : 0,
      deleteMany: async ({ where }) => {
        if (!matches(where)) return { count: 0 };
        reset = null;
        return { count: 1 };
      },
    },
    $executeRaw: async (sql, userId, tokenHash, expiry) => {
      if (tokenHash) reset = { userId, tokenHash, expiresAt: new Date(expiry) };
      return 1;
    },
    $transaction: fn => fn(db),
  };
  require('../dist/config/prisma').prisma = db;
  passport.serializeUser((user, done) => done(null, user.id));
  const app = express().use(express.json()).use(session({ secret: 'test-only', saveUninitialized: false, resave: false }))
    .use(passport.initialize()).use(passport.session()).use('/api/auth', require('../dist/routes/auth').default);
  const server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  try {
    const post = (path, data) => fetch('http://127.0.0.1:' + server.address().port + '/api/auth/' + path, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    const request = email => post('forgot-password', { email });
    const validate = token => post('reset-password/validate', { token });
    const change = token => post('reset-password', { token, password: 'Nueva de prueba' });
    assert.equal((await request('invalid')).status, 400);
    const unknown = await request('unknown@example.invalid');
    const known = await request(user.email);
    assert.equal(unknown.status, 202);
    assert.equal(known.status, 202);
    assert.deepEqual(await known.json(), await unknown.json());
    for (let i = 0; !messages.length && i < 100; i++) await new Promise(r => setTimeout(r, 10));
    assert.equal(messages.length, 1);
    const link = new URL(messages[0].text.match(/http:\/\/\S+/)[0]);
    assert.equal(link.origin + link.pathname, 'http://localhost:4200/restablecer-contrasena');
    const token = link.hash.slice(1);
    assert.equal(reset.tokenHash, crypto.createHash('sha256').update(token).digest('hex'));
    assert.equal((await validate(token)).status, 200);
    assert.equal((await validate('invalid')).status, 400);
    reset.expiresAt = new Date(0);
    assert.equal((await change(token)).status, 400);
    reset.expiresAt = new Date(Date.now() + 60000);
    assert.equal((await change(token)).status, 200);
    assert.equal((await change(token)).status, 400);
    assert.equal((await post('login', { email: user.email, password: 'Nueva de prueba' })).status, 200);
    rejectDelivery = true;
    assert.equal((await request(user.email)).status, 202);
    assert.equal(reset, null);
  } finally {
    server.close();
  }
});
