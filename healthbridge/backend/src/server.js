require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const { connectDB } = require('./db/pool');
const { connectRedis } = require('./db/redis');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Attempt connections, letting fallbacks activate on error
    await connectDB().catch((err) => {
      logger.warn(`PostgreSQL offline. Starting in MOCK DB Mode. (${err.message})`);
    });

    await connectRedis().catch((err) => {
      logger.warn(`Redis offline. Starting in MOCK Redis Mode. (${err.message})`);
    });

    app.listen(PORT, () => {
      logger.info(`HealthBridge API running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
