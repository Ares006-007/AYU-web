const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');
const logger = require('../utils/logger');

async function migrate() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      logger.error(`Migration schema.sql not found at: ${schemaPath}`);
      process.exit(1);
    }
    const sql = fs.readFileSync(schemaPath, 'utf8');
    logger.info('Running database migrations...');
    await pool.query(sql);
    logger.info('Database migrations completed successfully');
  } catch (err) {
    logger.error('Database migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
