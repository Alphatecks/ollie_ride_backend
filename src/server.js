const app = require("./app");
const env = require("./config/env");
const { testDbConnection } = require("./config/db");
const { createUsersTable } = require("./services/userService");

async function startServer() {
  try {
    await testDbConnection();
    await createUsersTable();

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
