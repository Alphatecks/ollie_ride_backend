const express = require("express");
const userRoutes = require("./userRoutes");
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

module.exports = router;
