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
  if (error && error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "Email already exists." });
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error." });
});

module.exports = app;
