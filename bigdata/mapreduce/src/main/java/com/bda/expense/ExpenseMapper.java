package com.bda.expense;

import java.io.IOException;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

/**
 * ExpenseMapper
 * 
 * Input format: date,category,amount,description,payment_method
 * Example: 2026-02-08,Dining Out,3100.00,Birthday dinner,Credit Card
 * 
 * Emits:
 * Key: Category (e.g., "Dining Out")
 * Value: Month:Amount (e.g., "2026-02:3100.00")
 */
public class ExpenseMapper extends Mapper<LongWritable, Text, Text, Text> {

    private Text categoryKey = new Text();
    private Text monthAmountVal = new Text();

    @Override
    protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {
        
        String line = value.toString().trim();
        if (line.isEmpty()) {
            return;
        }

        // Skip CSV Header line if present
        if (line.toLowerCase().startsWith("date,") || line.toLowerCase().startsWith("txndate,")) {
            return;
        }

        // Split CSV by comma while respecting quotes if any
        String[] tokens = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
        if (tokens.length < 3) {
            return; // invalid row
        }

        try {
            String dateStr = tokens[0].trim().replace("\"", "");
            String category = tokens[1].trim().replace("\"", "");
            String amountStr = tokens[2].trim().replaceAll("[₹$€£,\\s]", "").replace("\"", "");

            // Extract month YYYY-MM
            if (dateStr.length() < 7 || !dateStr.contains("-")) {
                return;
            }
            String monthKey = dateStr.substring(0, 7); // e.g. "2026-02"

            double amount = Double.parseDouble(amountStr);
            if (amount <= 0 || category.isEmpty()) {
                return;
            }

            categoryKey.set(category);
            monthAmountVal.set(monthKey + ":" + String.format("%.2f", amount));

            context.write(categoryKey, monthAmountVal);
        } catch (Exception e) {
            // Silently ignore corrupted rows in map stage
        }
    }
}
