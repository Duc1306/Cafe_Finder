require("dotenv").config();

module.exports = {
    development: {
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "cafe_finder_db",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: "mysql",
        logging: false,
    },
    test: {
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME_TEST || "cafe_finder_test",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: "mysql",
        logging: false,
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME_PROD,
        host: process.env.DB_HOST,
        dialect: "mysql",
        logging: false,
    },
};
