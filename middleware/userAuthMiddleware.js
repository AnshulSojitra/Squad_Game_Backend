const jwt = require("jsonwebtoken");
const { User } = require("../models");

const userAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    // fetch fresh user state
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    //  Block write operations
    if (user.isBlocked && req.method !== "GET") {
      return res.status(403).json({
        message: "Your account is blocked. You cannot perform this action.",
      });
    }

    // Attach fresh user data
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      isBlocked: user.isBlocked,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = userAuth;
