const jwt = require("jsonwebtoken");
const env = require("../config/env");

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return null;
  }
  return token;
}

function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ message: "Missing Authorization Bearer token." });
    }

    if (!env.auth.jwtSecret) {
      return res.status(500).json({ message: "Server auth is not configured." });
    }

    const payload = jwt.verify(token, env.auth.jwtSecret);
    req.auth = payload;
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

module.exports = {
  requireAuth,
};
