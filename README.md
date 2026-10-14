# Personal Expense Pattern Analysis

A full-stack, distributed **Big Data Analytics (BDA) College Mini-Project** designed to ingest, validate, store, and analyze real personal expenses downloaded from **Kaggle** or created manually across chronological billing cycles. The system computes category-wise monthly spending trends and triggers **budgeting alerts whenever spending in any category surges by strictly more than 25.0% compared with the previous month**.

---

## 🌟 Key Features

1. **Kaggle Dataset Ingestion & Column Mapping Engine**:
   - Upload any CSV from Kaggle, banking portals, or personal spreadsheets using drag-and-drop or file picker.
   - Previews the first rows of raw data and extracts column headers.
   - Auto-detects or lets users select **Date**, **Category**, **Amount**, **Description**, and **Payment Method** columns.
   - Handles multi-format dates (`YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`, `15-Jan-2026`, timestamps).
   - Scrubs currency symbols (`₹`, `$`, `€`, `£`, `Rs.`, `INR`, `USD`), commas, accounting parentheses `(150.00)`, and negative debit values (`-45.50` -> `₹45.50`).
   - Tracks metrics: **Accepted Rows**, **Skipped Rows**, **Duplicate Rows Handled**, and **Rejected Rows**.
   - Never silently discards valid records when format differences exist.
2. **Persistent Dataset Management**:
   - Displays currently active dataset filename (e.g., `kaggle_credit_card_expenses.csv` vs `personal_expenses_sample.csv`).
   - Clearly distinguishes uploaded data from sample data.
   - State is persisted on disk (`current_dataset.json` and `current_expenses.csv`) so the application remains fully functional across page refreshes and server restarts.
   - One-click "Reset to Sample Data" and "Upload Another Dataset" buttons.
3. **Overview Financial Dashboard**:
   - Total outlay, current-month expenditure, transaction volume, and active alerts.
   - Recharts monthly expense trend chart (Area & Multi-line).
   - Category distribution Donut chart with Indian Rupee (₹) formatting.
4. **Month-on-Month (MoM) Comparison Matrix**:
   - Chronological matrix tracking each category month-by-month.
   - Highlight badges for **surges strictly exceeding 25.0%**.
5. **Actionable Budgeting Alerts (> 25% Rule)**:
   - Identifies percentage surge, previous vs. current amounts, net increase, and tailored financial advice.
   - Handles edge cases: newly introduced categories (zero previous spending), decreases, and baseline months.
6. **Big Data Streaming & Storage Pipeline**:
   - **Apache Kafka**: Ingestion producer and consumer streaming active normalized records to topic `expense-transactions`.
   - **Hadoop HDFS**: Storage sink for raw transaction logs (`/user/hadoop/expenses/`).
   - **Hadoop MapReduce (Java)**: Distributed MapReduce job (`ExpenseAnalysisDriver`, `ExpenseMapper`, `ExpenseReducer`) executing the MoM 25% threshold rule.
   - **Local Demo Mode**: Seamless fallback with a clear UI status indicator when Kafka or Hadoop is offline.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 with Vite, Tailwind CSS, Recharts, Lucide Icons |
| **Backend API** | Node.js (v24), Express 4, Multer, KafkaJS |
| **Data Processing (Local Engine)** | Custom Node.js analytical engine (`analyticsService.js`) |
| **Streaming Engine** | Apache Kafka 7.5.0 (`kafkajs` client) |
| **Distributed Storage** | Apache Hadoop HDFS 3.3.6 (WebHDFS & native CLI) |
| **Big Data Batch Processing** | Java Hadoop MapReduce (`ExpenseAnalysisDriver.java`) |
| **Data Formats** | CSV, JSON, Tab-Separated HDFS Output (`part-r-00000`) |
| **Currency Formatting** | Indian Rupee (`₹` / `en-IN` numbering format) |

---

## 📊 Working With Real Kaggle Datasets

### Step 1: Download a Dataset from Kaggle
1. Visit [Kaggle](https://www.kaggle.com/datasets) and search for:
   - *"Personal Expense Dataset"*
   - *"Credit Card Financial Transactions"*
   - *"Daily Expense Tracker"*
   - *"India Consumer Expenditure"*
2. Download the `.zip` archive from Kaggle and extract the `.csv` file (or use the sample Kaggle datasets included in `sample_data/`).

### Step 2: Upload CSV through the Dashboard
1. Open the dashboard at `http://localhost:3000`.
2. Click **"Upload Dataset"** in the top navigation or sidebar.
3. Drag and drop your `.csv` file or click **"browse files"**.
4. The dashboard displays the selected **filename** and **file size** (e.g. `kaggle_credit_card_expenses.csv (4.2 KB)`).

### Step 3: Column Mapping & Preview
1. The system automatically inspects headers and presents a preview table of the first rows.
2. Select or verify the mapped columns:
   - **Date Column**: e.g., `Transaction Date`, `Date`, `Txn_Date`, `posting_date`
   - **Category Column**: e.g., `Expense Category`, `Category`, `Merchant_Category`, `Category Name`
   - **Amount Column**: e.g., `Transaction Amount`, `Amount`, `Cost`, `Debit`
   - **Description Column** (Optional): e.g., `Merchant`, `Description`, `Details`
   - **Payment Method Column** (Optional): e.g., `Card Type`, `Payment Mode`, `Channel`
3. Click **"Upload and Analyze Dataset"**.

### Step 4: Inspect Updated Analysis
- **Accepted Rows**, **Skipped Rows**, **Duplicates**, and **Rejected Rows** are displayed.
- The Overview Dashboard, Month-on-Month comparison table, and >25% budgeting alerts immediately update with the real Kaggle data!
- Active dataset filename is shown in the top header and dashboard card.

---

## 📁 Clean Folder Structure

```text
BDA-Project/
├── backend/
│   ├── src/
│   │   ├── config/config.js           # Server & Big Data ports/thresholds
│   │   ├── controllers/
│   │   │   ├── analyticsController.js # KPIs, trends, MoM comparison, alerts
│   │   │   ├── bigDataController.js   # Kafka status, HDFS status, MR results
│   │   │   └── expenseController.js   # Inspection, Column Mapping, CRUD & Upload
│   │   ├── routes/
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── bigDataRoutes.js
│   │   │   └── expenseRoutes.js
│   │   ├── services/
│   │   │   ├── analyticsService.js    # Mathematical 25% MoM logic & advice
│   │   │   ├── validationService.js   # Kaggle column detector, multi-date & currency scrubber
│   │   │   ├── kafkaService.js        # Kafka producer & fallback demo
│   │   │   └── hdfsService.js         # HDFS check & part-r-00000 parser
│   │   ├── data/
│   │   │   ├── dataStore.js           # Persistent store with disk JSON & CSV sync
│   │   │   ├── sample_expenses.csv    # Curated 5-month realistic dataset
│   │   │   └── current_dataset.json   # Active dataset persisted state
│   │   ├── app.js                     # Express app configuration
│   │   └── server.js                  # Server entrypoint (Port 5000)
│   ├── tests/
│   │   ├── analytics.test.js          # Tests: 25% threshold, zero prev, MoM
│   │   ├── validation.test.js         # Tests: Kaggle headers, multi-date, currencies
│   │   └── api.test.js                # Tests: REST APIs, inspect, mapping, dataset-info
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/                # Sidebar, Header (Active Dataset Badge)
│   │   │   ├── dashboard/             # StatCard, TrendChart, DonutChart
│   │   │   └── transactions/          # AddTransactionModal
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx      # Active dataset banner, KPIs & charts
│   │   │   ├── AnalyticsPage.jsx      # Multi-month stacked bar analysis
│   │   │   ├── MonthlyComparisonPage.jsx # MoM matrix comparison table
│   │   │   ├── AlertsPage.jsx         # >25% budgeting alerts & advice
│   │   │   ├── TransactionsPage.jsx   # Search, filter, pagination table
│   │   │   ├── UploadPage.jsx         # Kaggle CSV upload, preview & column mapping
│   │   │   └── BigDataPipelinePage.jsx# Kafka stream & MapReduce inspector
│   │   ├── services/api.js            # REST API client with inspect & mapping
│   │   ├── utils/formatters.js        # Indian Rupee (INR) & date formatters
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js                 # Vite config with backend proxy
│   ├── tailwind.config.js
│   └── package.json
│
├── bigdata/
│   ├── kafka/
│   │   ├── producer.js                # Node.js Kafka Producer (streams active normalized dataset)
│   │   ├── consumer.js                # Node.js Kafka Consumer for HDFS sink
│   │   └── package.json
│   ├── mapreduce/
│   │   ├── src/main/java/com/bda/expense/
│   │   │   ├── ExpenseMapper.java     # Map: <Category, Month:Amount>
│   │   │   ├── ExpenseReducer.java    # Reduce: MoM Delta & >25% Alert
│   │   │   └── ExpenseAnalysisDriver.java # Job runner
│   │   ├── pom.xml                    # Maven configuration for Hadoop 3.3.6
│   │   ├── sample_input/expenses.csv  # Input dataset synced with active data
│   │   ├── sample_output/part-r-00000 # Actual MapReduce output artifact
│   │   └── build-and-run.bat          # Windows batch runner
│   ├── docker/docker-compose.yml      # Zookeeper & Kafka Docker service
│   └── README.md
│
├── sample_data/
│   ├── personal_expenses_sample.csv   # 5-month curated Indian expense data
│   ├── kaggle_credit_card_expenses.csv# Realistic Kaggle credit card expense format
│   └── sample_template.csv            # Blank template for user downloads
├── .gitignore
└── README.md
```

---

## 🧮 MoM >25% Alert Mathematical Specification

For any category $c$ across consecutive chronological months $m_{i-1}$ and $m_i$:

1. If previous spending $S(m_{i-1}, c) > 0$:
   $$\Delta\% = \left(\frac{S(m_i, c) - S(m_{i-1}, c)}{S(m_{i-1}, c)}\right) \times 100$$
   - An alert is **strictly generated** when:
     $$\Delta\% > 25.0\%$$
   - If $\Delta\% \le 25.0\%$, no alert is generated.
   - If $\Delta\% \le 0\%$, no alert is generated.
2. If previous spending $S(m_{i-1}, c) = 0$ and current spending $S(m_i, c) > 0$:
   - Classified as a **Newly Introduced Expense Category** ($\Delta\% = +100.0\%$) and flagged as an alert.

---

## 🚀 Windows 11 Terminal Run Commands

> **Important PowerShell Note**: On Windows 11 PowerShell where script execution policy is restricted, use `npm.cmd` instead of `npm`.

### 1. Run Backend Server (Terminal 1)
```powershell
cd d:\Projects\BDA-Project\backend
node src/server.js
```
- **API URL**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

### 2. Run Frontend Dashboard (Terminal 2)
```powershell
cd d:\Projects\BDA-Project\frontend
npm.cmd run dev
```
- Open browser at: **`http://localhost:3000`**

### 3. Run Automated Tests (Terminal 3)
```powershell
cd d:\Projects\BDA-Project\backend
npm.cmd test
```
*Executes all 49 automated unit, analytical, and REST API test cases.*

---

## 🌐 Big Data Pipeline Execution (Optional / Lab Setup)

### Option A: Run Kafka with Docker
```powershell
cd d:\Projects\BDA-Project\bigdata\docker
docker-compose up -d
```

### Option B: Run Kafka Producer & Consumer
```powershell
# In terminal A (Start Consumer):
cd d:\Projects\BDA-Project\bigdata\kafka
node consumer.js

# In terminal B (Publish Active Dataset to Kafka):
cd d:\Projects\BDA-Project\bigdata\kafka
node producer.js
```

### Option C: Build & Run Hadoop MapReduce Job
```powershell
cd d:\Projects\BDA-Project\bigdata\mapreduce

# 1. Package JAR using Maven
mvn clean package

# 2. Upload active CSV to HDFS
hadoop fs -mkdir -p /user/hadoop/expenses/input
hadoop fs -put -f sample_input/expenses.csv /user/hadoop/expenses/input/

# 3. Submit MapReduce Job
hadoop jar target/expense-mapreduce-1.0-SNAPSHOT.jar com.bda.expense.ExpenseAnalysisDriver /user/hadoop/expenses/input /user/hadoop/expenses/output

# 4. View MapReduce Output File
hadoop fs -cat /user/hadoop/expenses/output/part-r-00000
```

---

## 🧪 Verification & Testing Status

| Component | Status | Environment |
|---|---|---|
| **Kaggle Column Auto-Detection** | **TESTED & PASSED (49/49 tests)** | Node.js Test Runner |
| **Multi-Format Date Parser** | **TESTED & PASSED** (`YYYY-MM-DD`, `DD/MM/YYYY`, `15-Jan-2026`) | Node.js Test Runner |
| **Currency & Debit Scruber** | **TESTED & PASSED** (`₹`, `$`, `Rs.`, negative debits) | Node.js Test Runner |
| **Column Mapping & Preview** | **TESTED & PASSED** | Node.js & React UI |
| **Duplicate De-duplication** | **TESTED & PASSED** | Node.js Test Runner |
| **Strict > 25% Alert Threshold** | **TESTED & PASSED** | Node.js Test Runner |
| **Zero Previous Month Spending** | **TESTED & PASSED** | Node.js Test Runner |
| **Persistent Storage Across Refreshes** | **TESTED & PASSED** | Node.js File System |
| **All Express REST APIs** | **TESTED & PASSED** | Node.js Test Runner |
| **React + Vite Production Build** | **TESTED & PASSED (0 errors)** | Vite / Rollup |
| **Kafka Active Dataset Streamer** | **CONFIGURED & READY** | KafkaJS Client |
| **Hadoop MapReduce Job** | **CONFIGURED & COMPILED** | Java 11 / Hadoop 3.3.6 |
