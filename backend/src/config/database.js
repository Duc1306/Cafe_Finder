const { Sequelize } = require("sequelize");
const config = require("./config");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connection established successfully");
    } catch (error) {
        console.error("❌ Unable to connect to the database:", error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, testConnection };