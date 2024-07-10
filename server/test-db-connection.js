import knex from "knex";
import "dotenv/config";

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8",
  },
});

db.raw("SELECT 1")
  .then(() => {
    console.log("Connection successful");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection failed", err);
    process.exit(1);
  });
