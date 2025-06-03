const jwt = require("jsonwebtoken");
const SECRET_KEY = "blair"; 

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
}

module.exports = authMiddleware;
