/**
 * Big Data Pipeline Controller
 * Manages Kafka streaming status, HDFS status, simulated streaming,
 * and Hadoop MapReduce output verification.
 */

const dataStore = require('../data/dataStore');
const kafkaService = require('../services/kafkaService');
const hdfsService = require('../services/hdfsService');
const config = require('../config/config');

// Health check across Big Data infrastructure (Kafka & Hadoop)
exports.getPipelineStatus = async (req, res) => {
  try {
    const [kafkaStatus, hdfsStatus] = await Promise.all([
      kafkaService.checkConnection(),
      hdfsService.checkConnection()
    ]);

    const isFullyConnected = kafkaStatus.connected && hdfsStatus.connected;
    const mode = isFullyConnected ? 'BIG_DATA_CONNECTED' : 'LOCAL_DEMO';

    res.json({
      success: true,
      mode,
      isFullyConnected,
      alertThreshold: config.budgetAlertThresholdPercent,
      services: {
        kafka: {
          name: 'Apache Kafka',
          role: 'Streaming Ingestion',
          status: kafkaStatus.connected ? 'CONNECTED' : 'DISCONNECTED',
          details: kafkaStatus
        },
        hdfs: {
          name: 'Hadoop HDFS',
          role: 'Distributed Storage',
          status: hdfsStatus.connected ? 'CONNECTED' : 'DISCONNECTED',
          details: hdfsStatus
        },
        mapreduce: {
          name: 'Hadoop MapReduce (Java)',
          role: 'Batch Processing & Pattern Analysis',
          status: 'CONFIGURED',
          driverClass: 'com.bda.expense.ExpenseAnalysisDriver'
        }
      },
      message: isFullyConnected
        ? 'Connected to live Apache Kafka broker and Hadoop cluster.'
        : 'Big Data services are offline. Running in Local Demo Mode using Node.js analytical engine with MapReduce output verification.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Stream current transactions to Kafka (or simulated buffer)
exports.streamToKafka = async (req, res) => {
  try {
    const transactions = req.body.transactions || dataStore.getAll();
    if (!transactions || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No transactions available to stream.'
      });
    }

    const result = await kafkaService.publishTransactions(transactions);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get streaming history / logs
exports.getStreamLogs = (req, res) => {
  try {
    const logs = kafkaService.getStreamLog();
    res.json({
      success: true,
      logs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get MapReduce batch processing results
exports.getMapReduceResults = (req, res) => {
  try {
    const results = hdfsService.getMapReduceResults();
    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
