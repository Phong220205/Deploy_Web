import 'dotenv/config';
import mysql from 'mysql2/promise';

const c = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

const [rows] = await c.execute(
  'SELECT contract_id, contract_number, project_id, status, created_at FROM contracts ORDER BY contract_id',
);
console.log(rows);
await c.end();
