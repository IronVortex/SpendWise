package com.bda.expense;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.conf.Configured;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.input.TextInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;
import org.apache.hadoop.util.Tool;
import org.apache.hadoop.util.ToolRunner;

/**
 * ExpenseAnalysisDriver
 * 
 * Main Driver class to execute the Hadoop MapReduce job for
 * Personal Expense Pattern Analysis and Budget Alert generation.
 */
public class ExpenseAnalysisDriver extends Configured implements Tool {

    @Override
    public int run(String[] args) throws Exception {
        if (args.length < 2) {
            System.err.println("Usage: ExpenseAnalysisDriver <input-hdfs-path> <output-hdfs-path>");
            System.err.println("Example: hadoop jar expense-analysis-1.0.jar com.bda.expense.ExpenseAnalysisDriver /expenses/input /expenses/output");
            return -1;
        }

        Path inputPath = new Path(args[0]);
        Path outputPath = new Path(args[1]);

        Configuration conf = getConf();
        Job job = Job.getInstance(conf, "Personal Expense Pattern Analysis - MoM 25% Alert");

        job.setJarByClass(ExpenseAnalysisDriver.class);

        // Mapper & Reducer setup
        job.setMapperClass(ExpenseMapper.class);
        job.setReducerClass(ExpenseReducer.class);

        // Map Output & Final Output Key/Value specifications
        job.setMapOutputKeyClass(Text.class);
        job.setMapOutputValueClass(Text.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(Text.class);

        job.setInputFormatClass(TextInputFormat.class);
        job.setOutputFormatClass(TextOutputFormat.class);

        FileInputFormat.addInputPath(job, inputPath);
        FileOutputFormat.setOutputPath(job, outputPath);

        // Clean up output path if already present
        FileSystem fs = outputPath.getFileSystem(conf);
        if (fs.exists(outputPath)) {
            System.out.println("Output path exists. Removing prior output: " + outputPath);
            fs.delete(outputPath, true);
        }

        System.out.println("=================================================");
        System.out.println(" Starting MapReduce Job: Expense Pattern Analysis");
        System.out.println(" Input Path  : " + inputPath);
        System.out.println(" Output Path : " + outputPath);
        System.out.println(" Threshold   : > 25.0% MoM Increase");
        System.out.println("=================================================");

        boolean success = job.waitForCompletion(true);
        if (success) {
            System.out.println("MapReduce Job completed successfully!");
            return 0;
        } else {
            System.err.println("MapReduce Job failed.");
            return 1;
        }
    }

    public static void main(String[] args) throws Exception {
        int exitCode = ToolRunner.run(new Configuration(), new ExpenseAnalysisDriver(), args);
        System.exit(exitCode);
    }
}
