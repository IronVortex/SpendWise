/**
 * Apache Kafka Expense Consumer
 * Reads transactions from Kafka topic 'expense-transactions' and ingests them into HDFS / local sink.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';
const { Kafka } = require('kafkajs');

const BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const TOPIC = process.env.KAFKA_TOPIC || 'expense-transactions';
const GROUP_ID = 'hdfs-ingestion-consumer-group';
const LOCAL_SINK_FILE = path.resolve(__dirname, '../mapreduce/sample_input/expenses_streamed.csv');
const WEBHDFS_URL = process.env.HADOOP_WEBHDFS_URL || 'http://localhost:9870/webhdfs/v1/user/hadoop/expenses/input/streamed_expenses.csv?op=APPEND';

async function appendToLocalSink(record) {
  if (!fs.existsSync(LOCAL_SINK_FILE)) {
    fs.writeFileSync(LOCAL_SINK_FILE, 'date,category,amount,description,payment_method\n', 'utf8');
  }
  const line = `${record.date},${record.category},${record.amount},"${record.description}",${record.paymentMethod}\n`;
  fs.appendFileSync(LOCAL_SINK_FILE, line, 'utf8');
}

async function runConsumer() {
  console.log('====================================================');
  console.log('   Apache Kafka to HDFS Consumer Service');
  console.log('====================================================');
  console.log(` Brokers     : ${BROKERS.join(', ')}`);
  console.log(` Topic       : ${TOPIC}`);
  console.log(` Group ID    : ${GROUP_ID}`);
  console.log(` Storage Sink: ${LOCAL_SINK_FILE}`);
  console.log('====================================================');

  const kafka = new Kafka({
    clientId: 'expense-hdfs-consumer',
    brokers: BROKERS,
    retry: { retries: 3 }
  });

  const consumer = kafka.consumer({ groupId: GROUP_ID });

  try {
    console.log('Connecting to Kafka broker...');
    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC, fromBeginning: true });
    console.log(`Subscribed to '${TOPIC}'. Waiting for incoming transactions...\n`);

    let count = 0;
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const rawValue = message.value.toString();
          const tx = JSON.parse(rawValue);
          count++;

          // Persist to local sink for Hadoop MapReduce ingestion
          await appendToLocalSink(tx);

          console.log(`[#${count} Partition:${partition} Offset:${message.offset}] Ingested to HDFS Sink: ${tx.date} | ${tx.category} | ₹${tx.amount}`);
        } catch (parseErr) {
          console.error('Error processing Kafka message:', parseErr.message);
        }
      }
    });
  } catch (err) {
    console.error('Kafka Consumer Error:', err.message);
    console.log('Make sure Kafka broker and Zookeeper are active.');
  }
}

runConsumer();
