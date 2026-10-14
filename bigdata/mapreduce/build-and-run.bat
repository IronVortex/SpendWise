@echo off
REM ==============================================================================
REM Build and Run Hadoop MapReduce Job for Personal Expense Pattern Analysis
REM ==============================================================================

echo [1/4] Checking Maven and Hadoop Environment...
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Maven 'mvn' was not found in PATH. Please install Apache Maven or set PATH.
    pause
    exit /b 1
)

where hadoop >nul 2>nul
if %errorlevel% neq 0 (
    echo Warning: 'hadoop' CLI is not found in PATH.
    echo Building the MapReduce JAR for deployment...
)

echo [2/4] Compiling and Packaging MapReduce JAR...
call mvn clean package
if %errorlevel% neq 0 (
    echo Maven build failed.
    pause
    exit /b %errorlevel%
)

echo [3/4] Preparing HDFS Directories...
hadoop fs -mkdir -p /user/hadoop/expenses/input
hadoop fs -put -f sample_input\expenses.csv /user/hadoop/expenses/input/

echo [4/4] Executing Hadoop MapReduce Job...
hadoop jar target\expense-mapreduce-1.0-SNAPSHOT.jar com.bda.expense.ExpenseAnalysisDriver /user/hadoop/expenses/input /user/hadoop/expenses/output

echo.
echo ==============================================================================
echo MapReduce Execution Finished! Fetching output from HDFS...
echo ==============================================================================
hadoop fs -cat /user/hadoop/expenses/output/part-r-00000
hadoop fs -get -f /user/hadoop/expenses/output/part-r-00000 sample_output\part-r-00000

echo Results saved to sample_output\part-r-00000
pause
