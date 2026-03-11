// require("dotenv").config();

// module.exports = {
//   development: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     dialect: "mysql",
//   },
// };

const fs = require("fs");
require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    dialectOptions: {
      // ssl: {
      //   ca: fs.readFileSync("D:/Workspace/MernStack/ca.pem"),
      //   rejectUnauthorized: true,
      // },
    },
  },
};
