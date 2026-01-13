// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (decoded.role !== "admin") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     req.admin = {
//       id: decoded.id,
//     };
//     next();
//   } catch {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

const jwt = require("jsonwebtoken");
const { Admin } = require("../models");

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // 🔍 Fetch live admin state from DB
    const admin = await Admin.findByPk(decoded.id);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // 🚫 Block WRITE operations for blocked admin
    if (admin.isBlocked && req.method !== "GET") {
      return res.status(403).json({
        message: "Your account is blocked. You cannot manage grounds.",
      });
    }

    req.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      isBlocked: admin.isBlocked,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = adminAuth;
