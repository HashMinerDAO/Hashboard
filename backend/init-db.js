require('dotenv').config();
const { query } = require('./db');
const crypto = require('crypto');

function generateUUID() {
  return crypto.randomUUID();
}

async function initializeDatabase() {
  try {
    console.log('🏗️  Initializing Hashboard database...');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        balance REAL DEFAULT 0,
        total_invested REAL DEFAULT 0,
        total_roi REAL DEFAULT 0,
        wallet_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create deposits table
    await query(`
      CREATE TABLE IF NOT EXISTS deposits (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        wallet_address TEXT NOT NULL,
        tx_hash TEXT,
        status TEXT DEFAULT 'pending',
        confirmed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Create investments table
    await query(`
      CREATE TABLE IF NOT EXISTS investments (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        roi_rate REAL,
        mining_hashrate REAL,
        start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_roi_update DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Create investment ROI history table
    await query(`
      CREATE TABLE IF NOT EXISTS investment_roi_history (
        id TEXT PRIMARY KEY,
        investment_id TEXT,
        roi_amount REAL NOT NULL,
        mining_performance REAL,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (investment_id) REFERENCES investments (id) ON DELETE CASCADE
      );
    `);

    // Create withdrawals table
    await query(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        wallet_address TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        processed_at DATETIME,
        tx_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await query('CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);');
    await query('CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);');
    await query('CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);');

    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables created: users, deposits, investments, investment_roi_history, withdrawals');
    console.log('🔍 Indexes created for optimal query performance');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase().then(() => {
    console.log('🎉 Database setup complete!');
    process.exit(0);
  });
}

module.exports = initializeDatabase;
