// Security smoke test: boots the real Express app (compiled) with an in-memory DB
// stand-in and checks that every hole found in the old code is now closed.
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
process.env.NODE_ENV = "production";
process.env.JWT_SECRET = "test-secret-test-secret-test-secret-123456";
const { prisma } = await import("../dist/lib/prisma.js");
const { createApp } = await import("../dist/app.js");
const { hashPassword } = await import("../dist/utils/password.js");

const server = createApp().listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const call = async (method, path, body, token) => {
  const r = await fetch(base + path, {
    method,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, body: await r.json().catch(() => ({})) };
};
let passed = 0;
const check = async (label, fn) => { await fn(); passed++; console.log("  ok -", label); };

// Arrange: an owner with a real password, and a passwordless roster entry.
await prisma.user.create({ data: { email: "clemonbalasuriyagroup@gmail.com", name: "Owner", role: "OWNER", passwordHash: await hashPassword("Real-Owner-Pass-1") } });
await prisma.user.create({ data: { email: "kaveen.construction@balasuriyagroup.tech", name: "Kaveen", role: "CONSTRUCTION_STAFF" } });

await check("old master passwords no longer log in", async () => {
  for (const pw of ["KmblT3CuvXYf", "ChangeMe123!", "Balasuriya@2026", "Admin@123", "Admin@2026", "anything123"]) {
    assert.equal((await call("POST", "/api/auth/login", { email: "clemonbalasuriyagroup@gmail.com", password: pw })).status, 401);
  }
});
await check("passwordless staff account can't log in with any password", async () => {
  assert.equal((await call("POST", "/api/auth/login", { email: "kaveen.construction@balasuriyagroup.tech", password: "12345678" })).status, 401);
});
await check("owner logs in with the real password; token works on /me", async () => {
  const r = await call("POST", "/api/auth/login", { email: "clemonbalasuriyagroup@gmail.com", password: "Real-Owner-Pass-1" });
  assert.equal(r.status, 200);
  assert.equal(r.body.user.role, "OWNER");
  assert.equal(r.body.user.passwordHash, undefined);
  const me = await call("GET", "/api/auth/me", null, r.body.token);
  assert.equal(me.status, 200);
});
await check("fake / unsigned / wrong-secret tokens are rejected", async () => {
  const owner = prisma._tables.user[0];
  const unsigned = jwt.sign({ sub: owner.id, email: owner.email, role: "OWNER" }, "", { algorithm: "none" });
  const wrongSecret = jwt.sign({ sub: owner.id }, "balasuriya_secure_otp_key_2026");
  const wrongSecret2 = jwt.sign({ sub: owner.id }, "balasuriya-group-default-jwt-secret-key-2026");
  for (const t of ["live_jwt_token_123", "bg_token_owner_1", unsigned, wrongSecret, wrongSecret2]) {
    assert.equal((await call("GET", "/api/auth/me", null, t)).status, 401, t.slice(0, 20));
    assert.equal((await call("GET", "/api/users", null, t)).status, 401);
  }
});
await check("staff API refuses anonymous list/create/reset/delete", async () => {
  assert.equal((await call("GET", "/api/users")).status, 401);
  assert.equal((await call("POST", "/api/users", { name: "X", email: "x@x.com", role: "OWNER", temporaryPassword: "12345678" })).status, 401);
  assert.equal((await call("POST", "/api/users/clemonbalasuriyagroup@gmail.com/reset-password", { temporaryPassword: "hacked123" })).status, 401);
  assert.equal((await call("DELETE", "/api/users/kaveen.construction@balasuriyagroup.tech")).status, 401);
});
let customerToken;
await check("registering always creates a CUSTOMER, even with a 'balasuriya' email", async () => {
  const r = await call("POST", "/api/auth/register", { name: "Sneaky", email: "x.balasuriya.clemon@gmail.com", password: "password123", role: "OWNER" });
  assert.equal(r.status, 201);
  assert.equal(r.body.user.role, "CUSTOMER");
  customerToken = r.body.token;
});
await check("a customer can't manage staff or promote themselves", async () => {
  assert.equal((await call("GET", "/api/users", null, customerToken)).status, 403);
  assert.equal((await call("POST", "/api/users", { name: "Me", email: "a@b.com", role: "OWNER", temporaryPassword: "12345678" }, customerToken)).status, 403);
  const me = prisma._tables.user.find((u) => u.email === "x.balasuriya.clemon@gmail.com");
  assert.equal((await call("PATCH", `/api/users/${me.id}`, { role: "OWNER" }, customerToken)).status, 403);
  assert.equal((await call("POST", "/api/auth/demo-login", { role: "OWNER" })).status, 404);
});
await check("forgot-password never returns the reset token in the response", async () => {
  const r = await call("POST", "/api/auth/forgot-password", { email: "clemonbalasuriyagroup@gmail.com" });
  assert.equal(r.status, 200);
  assert.equal(r.body.resetToken, undefined);
  assert.equal(r.body.resetUrl, undefined);
  const forged = await call("POST", "/api/auth/reset-password", { email: "clemonbalasuriyagroup@gmail.com", resetToken: `${Date.now() + 99999}:local_fallback`, newPassword: "hacked1234" });
  assert.equal(forged.status, 400);
  const forged2 = await call("POST", "/api/auth/reset-password", { email: "clemonbalasuriyagroup@gmail.com", resetToken: "verified_session", newPassword: "hacked1234" });
  assert.equal(forged2.status, 400);
});
await check("Google login without a verified Google token is refused", async () => {
  const r = await call("POST", "/api/auth/google", { email: "clemonbalasuriyagroup@gmail.com", name: "x" });
  assert.ok([400, 503].includes(r.status));
});
await check("visa applications: anonymous blocked; customers only see their own", async () => {
  assert.equal((await call("GET", "/api/visas")).status, 401);
  const c = await call("POST", "/api/visas", { userName: "Sneaky", phone: "0771234567", country: "UK", category: "TOURIST", passportNumber: "n1234567", userEmail: "victim@x.com", status: "APPROVED" }, customerToken);
  assert.equal(c.status, 201);
  assert.equal(c.body.application.status, "SUBMITTED", "client cannot set status");
  assert.equal(c.body.application.userEmail, "x.balasuriya.clemon@gmail.com", "client cannot file under another email");
  const other = await call("POST", "/api/auth/register", { name: "Other", email: "other@x.com", password: "password123" });
  const list = await call("GET", "/api/visas", null, other.body.token);
  assert.equal(list.body.applications.length, 0);
  assert.equal((await call("GET", `/api/visas/${c.body.application.id}`, null, other.body.token)).status, 404);
  assert.equal((await call("PATCH", `/api/visas/${c.body.application.id}`, { status: "APPROVED" }, customerToken)).body.application.status, "SUBMITTED");
});
await check("owner can create staff; new staff can then log in; suspension takes effect immediately", async () => {
  const owner = await call("POST", "/api/auth/login", { email: "clemonbalasuriyagroup@gmail.com", password: "Real-Owner-Pass-1" });
  const created = await call("POST", "/api/users", { name: "New Staff", email: "new@balasuriyagroup.tech", role: "TOURISM_STAFF", department: "Tourism & Travel", temporaryPassword: "Temp-Pass-123" }, owner.body.token);
  assert.equal(created.status, 201);
  const login = await call("POST", "/api/auth/login", { email: "new@balasuriyagroup.tech", password: "Temp-Pass-123" });
  assert.equal(login.status, 200);
  assert.equal((await call("PATCH", `/api/users/${created.body.user.id}`, { isActive: false }, owner.body.token)).status, 200);
  assert.equal((await call("GET", "/api/auth/me", null, login.body.token)).status, 401, "suspended user's old token stops working");
});
await check("health endpoint reports status without leaking secrets", async () => {
  const r = await call("GET", "/api/health");
  assert.equal(r.status, 200);
  assert.ok(!JSON.stringify(r.body).includes(process.env.JWT_SECRET));
});

server.close();
console.log(`\n${passed} security checks passed.`);
