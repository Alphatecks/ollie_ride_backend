const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  db: {
    client: process.env.DB_CLIENT || "supabase",
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "ollie_ride",
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    requiredOnBoot: process.env.DB_REQUIRED_ON_BOOT === "true",
  },
  supabase: {
    url: process.env.SUPABASE_URL || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY || "",
    fromAddress: process.env.EMAIL_FROM_ADDRESS || "",
  },
  auth: {
    otpTtlMinutes: Number(process.env.AUTH_OTP_TTL_MINUTES) || 10,
    passwordMinLength: Number(process.env.AUTH_PASSWORD_MIN_LENGTH) || 8,
    jwtSecret: process.env.AUTH_JWT_SECRET || "",
    jwtExpiresIn: process.env.AUTH_JWT_EXPIRES_IN || "30d",
  },
};

module.exports = env;
