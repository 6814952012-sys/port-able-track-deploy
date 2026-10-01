const express = require("express");
const {
    getTracks,
    getTrackById,
    createTrack,
    updateTrack,
    deleteTrack,
    downloadTrack,
} = require("../controllers/track.controller");

const router = express.Router();

router.get("/", getTracks);
router.post("/", createTrack);
router.get("/:id", getTrackById);
router.put("/:id", updateTrack);
router.patch("/:id", updateTrack);
router.delete("/:id", deleteTrack);
router.post("/:id/download", downloadTrack);

module.exports = router;