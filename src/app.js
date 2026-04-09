const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", routes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, _req, res, _next) => {
  const dbConnectionErrorCodes = new Set([
    "ECONNREFUSED",
    "ENOTFOUND",
    "ETIMEDOUT",
    "PROTOCOL_CONNECTION_LOST",
  ]);

  if (error && dbConnectionErrorCodes.has(error.code)) {
    return res.status(503).json({
      message: "Database is unavailable. Check database configuration.",
    });
  }

  if (error && error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "Email already exists." });
  }

  if (error && error.code === "23505") {
    return res.status(409).json({ message: "Email already exists." });
  }

  if (error && error.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid or expired token." });
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error." });
});

module.exports = app;
