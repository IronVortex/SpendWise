package com.bda.expense;

import java.io.IOException;
import java.util.Map;
import java.util.TreeMap;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

/**
 * ExpenseReducer
 * 
 * Aggregates all transactions for a given Category across chronological months,
 * computes Month-on-Month percentage increase, and flags categories where
 * spending surged by strictly more than 25.0%.
 * 
 * Output:
 * Category \t Month(YYYY-MM) \t TotalAmount \t MoMPercentChange \t AlertStatus
 */
public class ExpenseReducer extends Reducer<Text, Text, Text, Text> {

    private static final double ALERT_THRESHOLD_PERCENT = 25.0;
    private Text outputValue = new Text();

    @Override
    protected void reduce(Text key, Iterable<Text> values, Context context)
            throws IOException, InterruptedException {

        // Use TreeMap to automatically sort months chronologically (e.g. 2026-01, 2026-02)
        TreeMap<String, Double> monthlyTotals = new TreeMap<>();

        for (Text val : values) {
            String valStr = val.toString().trim();
            int splitIdx = valStr.indexOf(':');
            if (splitIdx == -1) continue;

            String month = valStr.substring(0, splitIdx);
            try {
                double amount = Double.parseDouble(valStr.substring(splitIdx + 1));
                monthlyTotals.put(month, monthlyTotals.getOrDefault(month, 0.0) + amount);
            } catch (NumberFormatException ignored) {}
        }

        Double previousAmount = null;

        for (Map.Entry<String, Double> entry : monthlyTotals.entrySet()) {
            String currentMonth = entry.getKey();
            double currentAmount = entry.getValue();

            String momChangeStr;
            String alertStatus;

            if (previousAmount == null) {
                // First observed month acts as baseline
                momChangeStr = "BASE_MONTH";
                alertStatus = "NORMAL";
            } else {
                if (previousAmount > 0.0) {
                    double percentChange = ((currentAmount - previousAmount) / previousAmount) * 100.0;
                    String sign = percentChange > 0 ? "+" : "";
                    momChangeStr = String.format("%s%.1f%%", sign, percentChange);

                    // Alert triggered STRICTLY when increase is > 25.0%
                    if (percentChange > ALERT_THRESHOLD_PERCENT) {
                        alertStatus = "ALERT_SURGE_GT_25";
                    } else {
                        alertStatus = "NORMAL";
                    }
                } else if (currentAmount > 0.0) {
                    // Previous month had 0 expenditure
                    momChangeStr = "+100.0%";
                    alertStatus = "ALERT_SURGE_GT_25";
                } else {
                    momChangeStr = "+0.0%";
                    alertStatus = "NORMAL";
                }
            }

            // Category \t Month \t Total \t Change% \t Status
            String resultLine = String.format("%s\t%.2f\t%s\t%s",
                    currentMonth, currentAmount, momChangeStr, alertStatus);

            outputValue.set(resultLine);
            context.write(key, outputValue);

            previousAmount = currentAmount;
        }
    }
}
