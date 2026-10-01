const test = require("node:test");
const assert = require("node:assert/strict");
const User = require("../src/models/user.model");

test("new users default to the user role", () => {
  const user = new User({ username: "member", email: "member@example.com", password: "secret123" });
  assert.equal(user.role, "user");
});

test("user roles are limited to user and admin", async () => {
  const user = new User({ username: "member", email: "member@example.com", password: "secret123", role: "owner" });
  await assert.rejects(user.validate(), /is not a valid enum value/);
});