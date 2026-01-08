const jwt = require("jsonwebtoken");

const userAuth = (req, res, next) => {
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

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = userAuth;

// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// const userAuth = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // 🔐 Role check (use consistent casing!)
//     if (decoded.role !== "USER") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     // 🔎 Fetch fresh user state from DB
//     const user = await User.findByPk(decoded.id);

//     if (!user) {
//       return res.status(401).json({ message: "User not found" });
//     }

//     // 🚫 Block check (LIVE DATA)
//     if (user.isBlocked) {
//       return res.status(403).json({
//         message: "Your account has been blocked. Please contact support.",
//       });
//     }

//     req.user = user; // attach full user object
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

// module.exports = userAuth;
