const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "ollie_ride",
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    requiredOnBoot: process.env.DB_REQUIRED_ON_BOOT === "true",
  },
};

module.exports = env;
