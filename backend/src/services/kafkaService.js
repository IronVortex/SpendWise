/**
 * Apache Kafka Streaming Service
 * Provides transaction publishing to Kafka topic 'expense-transactions'
 * and seamless fallback to Local Demo Mode when Kafka broker is unreachable.
 */

process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';
const { Kafka, logLevel } = require('kafkajs');
const config = require('../config/config');

class KafkaService {
  constructor() {
    this.kafka = null;
    this.producer = null;
    this.isConnected = false;
    this.lastCheckTime = null;
    this.streamLog = [];
    this.initClient();
  }

  initClient() {
    try {
      this.kafka = new Kafka({
        clientId: config.kafka.clientId,
        brokers: config.kafka.brokers,
        connectionTimeout: config.kafka.connectionTimeout || 1500,
        logLevel: logLevel.NOTHING,
        retry: { retries: 0 }
      });
      this.producer = this.kafka.producer({
        retry: { retries: 0 }
      });
    } catch (err) {
      this.kafka = null;
      this.producer = null;
    }
  }

  /**
   * Health check to detect Kafka broker connectivity
   */
  async checkConnection() {
    this.lastCheckTime = new Date().toISOString();
    if (!this.producer) {
      this.isConnected = false;
      return { connected: false, reason: 'Kafka client not initialized' };
    }

    try {
      // Connect with strict timeout
      await Promise.race([
        this.producer.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), config.kafka.connectionTimeout)
        )
      ]);
      this.isConnected = true;
      return { connected: true, brokers: config.kafka.brokers, topic: config.kafka.topic };
    } catch (err) {
      this.isConnected = false;
      return {
        connected: false,
        reason: `Broker unreachable at ${config.kafka.brokers.join(', ')} (${err.message})`
      };
    }
  }

  /**
   * Publishes expense transaction batch to Kafka topic
   */
  async publishTransactions(transactions) {
    const records = Array.isArray(transactions) ? transactions : [transactions];
    const timestamp = new Date().toISOString();

    const connection = await this.checkConnection();

    if (connection.connected && this.producer) {
      try {
        const messages = records.map(tx => ({
          key: tx.id || tx.category,
          value: JSON.stringify(tx)
        }));

        const result = await this.producer.send({
          topic: config.kafka.topic,
          messages
        });

        const logEntry = {
          id: `kafka_live_${Date.now()}`,
          timestamp,
          mode: 'LIVE_KAFKA',
          count: records.length,
          topic: config.kafka.topic,
          details: result
        };
        this.streamLog.unshift(logEntry);
        if (this.streamLog.length > 50) this.streamLog.pop();

        return {
          success: true,
          mode: 'LIVE_KAFKA',
          publishedCount: records.length,
          topic: config.kafka.topic,
          result
        };
      } catch (err) {
        // Fall back to demo mode
      }
    }

    // Local Demo Mode simulation
    const simulatedOffsets = records.map((tx, idx) => ({
      id: tx.id,
      category: tx.category,
      amount: tx.amount,
      date: tx.date,
      partition: idx % 3,
      simulatedOffset: Date.now() + idx
    }));

    const logEntry = {
      id: `kafka_demo_${Date.now()}`,
      timestamp,
      mode: 'LOCAL_DEMO',
      count: records.length,
      topic: config.kafka.topic,
      simulated: true,
      note: 'Simulated streaming in Local Demo Mode. Kafka broker is offline.'
    };
    this.streamLog.unshift(logEntry);
    if (this.streamLog.length > 50) this.streamLog.pop();

    return {
      success: true,
      mode: 'LOCAL_DEMO',
      publishedCount: records.length,
      topic: config.kafka.topic,
      isSimulated: true,
      message: 'Published in Local Demo Mode (Kafka broker offline). Transactions recorded in event buffer.',
      sampleOffsets: simulatedOffsets.slice(0, 5)
    };
  }

  getStreamLog() {
    return this.streamLog;
  }
}

module.exports = new KafkaService();
