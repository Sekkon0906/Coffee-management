const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

function auth(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "No autenticado" });
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;

      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ message: "No autorizado" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }
  };
}

module.exports = { auth };
