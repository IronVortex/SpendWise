/**
 * Application Configuration
 */
const path = require('path');

module.exports = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  
  // Authentication
  jwtSecret: process.env.JWT_SECRET || 'spendsense_super_secure_jwt_secret_key_2026',
  
  // Big Data Processing Threshold
  budgetAlertThresholdPercent: 25.0, // strictly > 25% triggers an alert
  
  // Apache Kafka Configuration
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || 'expense-tracker-client',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    topic: process.env.KAFKA_TOPIC || 'expense-transactions',
    connectionTimeout: 2000
  },
  
  // Hadoop HDFS Configuration
  hdfs: {
    webHdfsUrl: process.env.HADOOP_WEBHDFS_URL || 'http://localhost:9870/webhdfs/v1',
    targetPath: process.env.HADOOP_EXPENSES_PATH || '/user/hadoop/expenses/transactions.csv',
    connectionTimeout: 2000
  },

  // File Paths
  paths: {
    sampleData: path.resolve(__dirname, '../data/sample_expenses.csv'),
    mapReduceSampleOutput: path.resolve(__dirname, '../../../bigdata/mapreduce/sample_output/part-r-00000')
  }
};
