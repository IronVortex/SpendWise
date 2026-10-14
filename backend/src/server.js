/**
 * Server Entrypoint
 */

const app = require('./app');
const config = require('./config/config');

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log(' SpendSense | Personal Expense Pattern Analysis');
  console.log('====================================================');
  console.log(` Server running on : http://localhost:${PORT}`);
  console.log(` Alert Threshold   : > ${config.budgetAlertThresholdPercent}% MoM Increase`);
  console.log(` Health Check API  : http://localhost:${PORT}/api/health`);
  console.log(` Big Data Status   : http://localhost:${PORT}/api/bigdata/status`);
  console.log(' Mode              : Local Demo Engine (Fallback active if Kafka/Hadoop offline)');
  console.log('====================================================');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});
