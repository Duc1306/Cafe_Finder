// backend/src/config/config.js
require("dotenv").config();

module.exports = {
    development: {
        username: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "your_password",
        database: process.env.DB_NAME || "cafe_finder_dev",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: "postgres",
        logging: false,          
    },
    test: {
        username: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "your_password",
        database: process.env.DB_NAME_TEST || "cafe_finder_test",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: "postgres",
        logging: false,          
    },
     production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
