/**
 * Apache Kafka Expense Producer
 * Reads transactions from CSV and streams them into Kafka topic 'expense-transactions'.
 */

const fs = require('fs');
const path = require('path');
process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';
const { Kafka } = require('kafkajs');

const BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const TOPIC = process.env.KAFKA_TOPIC || 'expense-transactions';
const CLIENT_ID = 'expense-producer-cli';
const DEFAULT_CSV = fs.existsSync(path.resolve(__dirname, '../../backend/src/data/current_expenses.csv'))
  ? path.resolve(__dirname, '../../backend/src/data/current_expenses.csv')
  : path.resolve(__dirname, '../../sample_data/personal_expenses_sample.csv');
const CSV_FILE = process.argv[2] || DEFAULT_CSV;
const DELAY_MS = parseInt(process.env.STREAM_DELAY_MS || '400', 10);

async function runProducer() {
  console.log('====================================================');
  console.log('   Apache Kafka Expense Producer CLI');
  console.log('====================================================');
  console.log(` Brokers : ${BROKERS.join(', ')}`);
  console.log(` Topic   : ${TOPIC}`);
  console.log(` Data    : ${CSV_FILE}`);
  console.log(` Interval: ${DELAY_MS} ms/record`);
  console.log('====================================================');

  if (!fs.existsSync(CSV_FILE)) {
    console.error(`Error: Sample CSV file not found at: ${CSV_FILE}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(CSV_FILE, 'utf8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length <= 1) {
    console.error('Error: CSV file contains no data rows.');
    process.exit(1);
  }

  const kafka = new Kafka({
    clientId: CLIENT_ID,
    brokers: BROKERS,
    retry: { retries: 3 }
  });

  const producer = kafka.producer();

  try {
    console.log('Connecting to Kafka broker...');
    await producer.connect();
    console.log('Connected successfully!');

    // Read headers
    const header = lines[0].split(',');
    console.log(`Streaming ${lines.length - 1} records to topic '${TOPIC}'...`);

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const payload = {
        id: `tx_${Date.now()}_${i}`,
        date: cols[0]?.trim(),
        category: cols[1]?.trim(),
        amount: parseFloat(cols[2]?.trim() || '0'),
        description: cols[3]?.trim() || '',
        paymentMethod: cols[4]?.trim() || 'UPI',
        producedAt: new Date().toISOString()
      };

      await producer.send({
        topic: TOPIC,
        messages: [
          {
            key: payload.category,
            value: JSON.stringify(payload)
          }
        ]
      });

      console.log(`[${i}/${lines.length - 1}] Sent: ${payload.date} | ${payload.category} | ₹${payload.amount} | "${payload.description}"`);
      await new Promise(r => setTimeout(r, DELAY_MS));
    }

    console.log('\nStreaming complete! All transactions successfully published to Kafka.');
  } catch (err) {
    console.error('Kafka Producer Error:', err.message);
    console.log('\nNote: If Kafka is not currently running locally, start Kafka or test in Local Demo Mode via the Web Dashboard.');
  } finally {
    await producer.disconnect();
  }
}

runProducer();
