if (!process.env.DB_PASSWORD) throw new Error("DB_PASSWORD must be configured");

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'yardex',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

module.exports = pool;
