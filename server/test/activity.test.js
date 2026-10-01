const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");
const User = require("../src/models/user.model");
const Activity = require("../src/models/activity.model");

const ownerId = "64c13ab08edf48a008793cac";
const activityId = "64c13ab08edf48a008793cad";
const otherActivityId = "64c13ab08edf48a008793cae";

test("Activities API authenticates and scopes every operation to the current user", async (t) => {
  const originals = {
    findUserById: User.findById,
    find: Activity.find,
    create: Activity.create,
    findOneAndUpdate: Activity.findOneAndUpdate,
    findOneAndDelete: Activity.findOneAndDelete,
  };
  let createInput;
  let updateFilter;
  let deleteFilter;
  let listFilter;
  const listRecords = [{ _id: activityId, user: ownerId, type: "walk", durationMin: 30, date: new Date("2026-10-01T08:00:00.000Z") }];
  const weeklyRecords = [
    { durationMin: 30, distanceKm: 2.5, date: new Date("2026-10-01T08:00:00.000Z") },
    { durationMin: 45, distanceKm: 5, date: new Date("2026-09-30T08:00:00.000Z") },
  ];
  const streakRecords = [
    { date: new Date("2026-10-01T08:00:00.000Z") },
    { date: new Date("2026-09-30T08:00:00.000Z") },
    { date: new Date("2026-09-29T08:00:00.000Z") },
  ];

  User.findById = (id) => ({ select: async () => id === ownerId ? { _id: ownerId } : null });
  Activity.find = (filter) => {
    listFilter = filter;
    const result = filter.date?.$gte ? weeklyRecords : filter.date?.$lte ? streakRecords : listRecords;
    return {
      sort() { return this; },
      select() { return this; },
      then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); },
    };
  };
  Activity.create = async (input) => {
    createInput = input;
    return { _id: activityId, ...input };
  };
  Activity.findOneAndUpdate = async (filter, updates) => {
    updateFilter = filter;
    return filter._id === activityId ? { _id: activityId, ...updates.$set } : null;
  };
  Activity.findOneAndDelete = async (filter) => {
    deleteFilter = filter;
    return filter._id === activityId ? { _id: activityId } : null;
  };

  const server = app.listen(0);
  t.after(async () => {
    User.findById = originals.findUserById;
    Activity.find = originals.find;
    Activity.create = originals.create;
    Activity.findOneAndUpdate = originals.findOneAndUpdate;
    Activity.findOneAndDelete = originals.findOneAndDelete;
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });
  await new Promise((resolve) => server.once("listening", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}/api/activities`;
  const authHeaders = { "Content-Type": "application/json", "x-user-id": ownerId };

  const unauthenticated = await fetch(baseUrl);
  assert.equal(unauthenticated.status, 401);
  assert.deepEqual(await unauthenticated.json(), { message: "Authentication required" });

  const malformedJson = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{invalid",
  });
  assert.equal(malformedJson.status, 400);
  assert.deepEqual(await malformedJson.json(), { message: "Invalid JSON body" });

  const listed = await fetch(baseUrl, { headers: authHeaders });
  assert.equal(listed.status, 200);
  assert.equal((await listed.json())[0]._id, activityId);
  assert.deepEqual(listFilter, { user: ownerId });

  const invalidCreate = await fetch(baseUrl, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ type: "walk", durationMin: 0 }),
  });
  assert.equal(invalidCreate.status, 400);
  assert.equal(createInput, undefined);

  const invalidNumericType = await fetch(baseUrl, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ type: "walk", durationMin: true }),
  });
  assert.equal(invalidNumericType.status, 400);

  const created = await fetch(baseUrl, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ type: "run", durationMin: "25", distanceKm: "4.2", note: "  Easy run  " }),
  });
  assert.equal(created.status, 201);
  assert.deepEqual(createInput, {
    type: "run",
    durationMin: 25,
    distanceKm: 4.2,
    note: "Easy run",
    user: ownerId,
  });

  const updated = await fetch(`${baseUrl}/${activityId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ type: "cycle", durationMin: 40, distanceKm: 12, date: "2026-10-01", note: "Ride" }),
  });
  assert.equal(updated.status, 200);
  assert.deepEqual(updateFilter, { _id: activityId, user: ownerId });

  const missingUpdate = await fetch(`${baseUrl}/${otherActivityId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ type: "cycle", durationMin: 40 }),
  });
  assert.equal(missingUpdate.status, 404);
  assert.deepEqual(updateFilter, { _id: otherActivityId, user: ownerId });

  const deleted = await fetch(`${baseUrl}/${activityId}`, { method: "DELETE", headers: authHeaders });
  assert.equal(deleted.status, 200);
  assert.deepEqual(deleteFilter, { _id: activityId, user: ownerId });

  const statsResponse = await fetch(`${baseUrl}/stats`, { headers: authHeaders });
  assert.equal(statsResponse.status, 200);
  const stats = await statsResponse.json();
  assert.equal(stats.totalSessions, 2);
  assert.equal(stats.totalMinutes, 75);
  assert.equal(stats.totalDistanceKm, 7.5);
  assert.equal(stats.streak, 3);
});
