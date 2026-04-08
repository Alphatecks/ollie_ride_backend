const app = require("./app");
const env = require("./config/env");
const { testDbConnection } = require("./config/db");
const { createUsersTable } = require("./services/userService");
const { setDatabaseReady } = require("./config/runtimeState");

async function initializeDatabase() {
  try {
    await testDbConnection();
    await createUsersTable();
    setDatabaseReady(true, null);
    console.log("Database connected successfully.");
    return true;
  } catch (error) {
    setDatabaseReady(false, error.message);
    console.error("Database not ready:", error.message);
    return false;
  }
}

async function startServer() {
  const dbReady = await initializeDatabase();

  if (env.db.requiredOnBoot && !dbReady) {
    console.error("Failed to start server: database is required on boot.");
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

startServer();
