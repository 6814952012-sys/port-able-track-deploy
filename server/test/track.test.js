const test = require("node:test");
const assert = require("node:assert/strict");
const Track = require("../src/models/track.model");
const trackRoutes = require("../src/routes/track.routes");
const {
  getTrackById,
  updateTrack,
  deleteTrack,
} = require("../src/controllers/track.controller");

const invoke = async (controller, req) => {
  const response = {
    statusCode: 200,
    body: undefined,
    ended: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
  let nextError;
  await controller(req, response, (error) => {
    nextError = error;
  });
  if (nextError) throw nextError;
  return response;
};

test("registers RESTful track CRUD routes and keeps download action", () => {
  const routes = trackRoutes.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods),
    }));

  assert.deepEqual(routes, [
    { path: "/", methods: ["get"] },
    { path: "/", methods: ["post"] },
    { path: "/:id", methods: ["get"] },
    { path: "/:id", methods: ["put"] },
    { path: "/:id", methods: ["patch"] },
    { path: "/:id", methods: ["delete"] },
    { path: "/:id/download", methods: ["post"] },
  ]);
});

test("returns 404 when a track does not exist", async () => {
  const originalFindById = Track.findById;
  Track.findById = async () => null;
  try {
    const response = await invoke(getTrackById, { params: { id: "missing" } });
    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.body, { message: "Track not found" });
  } finally {
    Track.findById = originalFindById;
  }
});

test("updates only editable track fields", async () => {
  const originalFindByIdAndUpdate = Track.findByIdAndUpdate;
  let updateArgs;
  Track.findByIdAndUpdate = async (...args) => {
    updateArgs = args;
    return { _id: "track-1", title: "Updated title" };
  };
  try {
    const response = await invoke(updateTrack, {
      params: { id: "track-1" },
      body: { title: "Updated title", downloads: 999 },
    });
    assert.deepEqual(updateArgs, [
      "track-1",
      { title: "Updated title" },
      { new: true, runValidators: true },
    ]);
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.title, "Updated title");
  } finally {
    Track.findByIdAndUpdate = originalFindByIdAndUpdate;
  }
});

test("deletes a track with an empty 204 response", async () => {
  const originalFindByIdAndDelete = Track.findByIdAndDelete;
  Track.findByIdAndDelete = async () => ({ _id: "track-1" });
  try {
    const response = await invoke(deleteTrack, { params: { id: "track-1" } });
    assert.equal(response.statusCode, 204);
    assert.equal(response.ended, true);
    assert.equal(response.body, undefined);
  } finally {
    Track.findByIdAndDelete = originalFindByIdAndDelete;
  }
});
