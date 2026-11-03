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

const [res] = await c.execute(
  "DELETE FROM contact_requests WHERE full_name LIKE 'Smoke%' OR subject LIKE 'Smoke%' OR email = 'smoke@example.com'"
);
console.log('contact_requests deleted:', res.affectedRows);

const [rows] = await c.execute('SELECT COUNT(*) AS n FROM contact_requests');
console.log('contacts total:', rows[0].n);
await c.end();
