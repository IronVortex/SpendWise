# Big Data Streaming & Processing Subsystem

This subsystem implements the distributed streaming ingestion, storage, and batch processing layers for **Personal Expense Pattern Analysis**.

## Architecture & Data Flow

```text
+-------------------------+
| React Dashboard & CSV   |
+------------+------------+
             |
             v (HTTP POST / File)
+-------------------------+
| Node.js / Express API   |
+------------+------------+
             |
             v (Producer: key=Category, value=JSON)
+-------------------------+
| Apache Kafka Broker     | Topic: expense-transactions
+------------+------------+
             |
             v (Consumer Group: hdfs-ingestion-consumer-group)
+-------------------------+
| Kafka Consumer Service  |
+------------+------------+
             |
             v (HDFS Append / WebHDFS REST API)
+-------------------------+
| Hadoop HDFS Storage     | Path: /user/hadoop/expenses/input/
+------------+------------+
             |
             v (Hadoop Distributed Batch Processing)
+-------------------------+
| Java MapReduce Job      | ExpenseAnalysisDriver
| - ExpenseMapper         | Map: <Category, YYYY-MM:Amount>
| - ExpenseReducer        | Reduce: Calculates MoM % Delta & >25% Alert
+------------+------------+
             |
             v (HDFS Output)
+-------------------------+
| Output File             | /user/hadoop/expenses/output/part-r-00000
+-------------------------+
```

---

## 1. Apache Kafka Streaming Component

### Producer (`bigdata/kafka/producer.js`)
- Streams transactions from `sample_data/personal_expenses_sample.csv` or user-uploaded records into Kafka topic `expense-transactions`.
- Uses partition keys based on `Category` to ensure all transactions of the same category are processed in order.
- To execute:
  ```powershell
  cd bigdata/kafka
  npm.cmd install
  npm.cmd run start-producer
  ```

### Consumer (`bigdata/kafka/consumer.js`)
- Subscribes to `expense-transactions` with consumer group `hdfs-ingestion-consumer-group`.
- Buffers and streams incoming transactions to Hadoop HDFS or local ingestion sink (`bigdata/mapreduce/sample_input/expenses_streamed.csv`).
- To execute:
  ```powershell
  cd bigdata/kafka
  npm.cmd run start-consumer
  ```

---

## 2. Hadoop MapReduce Job (Java)

### Classes:
1. **`ExpenseMapper.java`**:
   - Parses CSV lines: `date,category,amount,description,payment_method`.
   - Strips currency symbols (`₹`, `$`) and commas.
   - Extracts Month `YYYY-MM`.
   - Emits: `Key = Category (Text)`, `Value = Month:Amount (Text)`.

2. **`ExpenseReducer.java`**:
   - Collects all monthly spending for a category into an ordered `TreeMap<String, Double>` (ensuring chronological month order: `2026-01`, `2026-02`, etc.).
   - Computes Month-on-Month (MoM) delta:
     $$\text{MoM Change \%} = \frac{\text{Current Month Spend} - \text{Previous Month Spend}}{\text{Previous Month Spend}} \times 100$$
   - Flags an alert strictly when:
     $$\text{MoM Change \%} > 25.0\%$$
   - Emits tab-separated records:
     `Category \t Month \t TotalAmount \t MoMChange% \t Status`
     *(Status is `ALERT_SURGE_GT_25` if > 25%, else `NORMAL`)*.

3. **`ExpenseAnalysisDriver.java`**:
   - Main entry point configuring Job, Formats, Input/Output HDFS paths, and Reducer tasks.

### Compiling and Running on Hadoop:
```powershell
# In Windows 11 terminal (with Maven & Hadoop installed):
cd bigdata/mapreduce

# 1. Package JAR using Maven
mvn clean package

# 2. Upload input CSV to HDFS
hadoop fs -mkdir -p /user/hadoop/expenses/input
hadoop fs -put -f sample_input/expenses.csv /user/hadoop/expenses/input/

# 3. Submit MapReduce Job
hadoop jar target/expense-mapreduce-1.0-SNAPSHOT.jar com.bda.expense.ExpenseAnalysisDriver /user/hadoop/expenses/input /user/hadoop/expenses/output

# 4. Read output from HDFS
hadoop fs -cat /user/hadoop/expenses/output/part-r-00000
```

---

## 3. Running Kafka & Zookeeper via Docker

If Docker is available:
```powershell
cd bigdata/docker
docker-compose up -d
```
This spins up:
- Zookeeper on `localhost:2181`
- Kafka Broker on `localhost:9092`
