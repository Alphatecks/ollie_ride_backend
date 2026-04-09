const app = require("./app");
const env = require("./config/env");
const { testDbConnection } = require("./config/db");
const { testSupabaseConnection } = require("./config/supabase");
const { createUsersTable } = require("./services/userService");
const { initializeAuthTables } = require("./services/authService");
const { setDatabaseReady } = require("./config/runtimeState");

async function initializeDatabase() {
  try {
    if (env.db.client === "supabase") {
      await testSupabaseConnection();
    } else {
      await testDbConnection();
    }

    await createUsersTable();
    await initializeAuthTables();
    setDatabaseReady(true, null);
    console.log(`Database connected successfully using ${env.db.client}.`);
    return true;
  } catch (error) {
    setDatabaseReady(false, error.message);
    console.error(`Database not ready (${env.db.client}):`, error.message);
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
