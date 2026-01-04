import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "CodeHive",
  password: "Kishan123@$",
  port: 5432,
});
 