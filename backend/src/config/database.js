const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
