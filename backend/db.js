const dbType = process.env.DB_TYPE || 'postgres';

let pool, query;

if (dbType === 'sqlite') {
  // SQLite configuration for testing
  const sqlite3 = require('sqlite3').verbose();
  const { promisify } = require('util');

  // Create SQLite database
  const db = new sqlite3.Database('./hashboard_test.db', (err) => {
    if (err) {
      console.error('❌ SQLite connection error:', err.message);
    } else {
      console.log('📊 Connected to SQLite database');
    }
  });

  // Promisify SQLite methods
  const dbAll = promisify(db.all.bind(db));
  const dbRun = promisify(db.run.bind(db));
  const dbGet = promisify(db.get.bind(db));

  query = async (text, params = []) => {
    const start = Date.now();
    try {
      let result;
      if (text.trim().toUpperCase().startsWith('SELECT')) {
        result = await dbAll(text, params);
        console.log('✅ Executed SELECT query', { text, duration: Date.now() - start, rows: result.length });
        return { rows: result, rowCount: result.length };
      } else {
        result = await dbRun(text, params);
        console.log('✅ Executed query', { text, duration: Date.now() - start, result: result });
        return { rowCount: result ? (result.changes || 0) : 0 };
      }
    } catch (err) {
      console.error('❌ SQLite query error:', err);
      throw err;
    }
  };

  pool = db; // For compatibility

} else {
  // PostgreSQL configuration
  const { Pool } = require('pg');

  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'hashboard_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test database connection
  pool.on('connect', () => {
    console.log('📊 Connected to PostgreSQL database');
  });

  pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
  });

  // Query helper function
  query = async (text, params) => {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('✅ Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (err) {
      console.error('❌ Query error:', err);
      throw err;
    }
  };
}

module.exports = {
  pool,
  query
};
