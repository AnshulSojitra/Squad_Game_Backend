require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/db");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// sequelize.authenticate()
//   .then(() => {
//     console.log("✅ Database connected successfully");

//     app.listen(process.env.PORT, () => {
//       console.log(`🚀 Server running on port ${process.env.PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ Database connection failed:", err);
//   });
