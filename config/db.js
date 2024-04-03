import Sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config({ path: ".env" }); //location of the .env file

const db = new Sequelize(
  process.env.DB_NAME, //Environment variables are used
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: 3307,
    dialect: "mysql",
    define: {
      timestamps: true, //When a user registers it adds two extra columns to the users table
    },
    pool: {
      //Configure behavior for new or existing connections per person
      max: 5, //maximum connections
      min: 0, //minimum connections
      acquire: 30000, //time before mark an error
      idle: 10000, //time that must elapse to terminate a connection to the database to free space or memory
    },
    operatorAliases: false,
  }
);

export default db;
