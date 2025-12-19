const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  console.log("✅ AUTH HIT:", req.method, req.originalUrl);

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;

  if (!token) {
    console.log("❌ AUTH: no token");
    return res.status(401).json({ message: "No token" });
  }

  if (!process.env.JWT_SECRET) {
    console.log("❌ AUTH: JWT_SECRET missing in env");
    return res.status(500).json({ message: "JWT_SECRET missing on server" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ AUTH OK decoded:", decoded);
    req.user = decoded;
    return next();
  } catch (e) {
    console.log("❌ AUTH VERIFY FAILED:", e.message);
    return res.status(401).json({ message: e.message });
  }
}

function isAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
}

module.exports = { auth, isAdmin };
