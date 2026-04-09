const express = require("express");
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const { getRuntimeState } = require("../config/runtimeState");

const router = express.Router();

router.get("/health", (_req, res) => {
  const runtimeState = getRuntimeState();

  res.json({
    message: "Backend is running",
    database: {
      connected: runtimeState.isDatabaseReady,
      lastError: runtimeState.lastDatabaseError,
    },
    timestamp: new Date().toISOString(),
  });
});

router.use("/users", userRoutes);
router.use("/auth", authRoutes);

module.exports = router;
