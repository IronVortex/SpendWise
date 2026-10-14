/**
 * Hadoop HDFS and MapReduce Integration Service
 * Reads MapReduce outputs, checks WebHDFS connectivity,
 * and parses output files (part-r-00000) for comparison with the local engine.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const config = require('../config/config');

class HdfsService {
  constructor() {
    this.sampleOutputPath = path.resolve(
      __dirname,
      '../../../bigdata/mapreduce/sample_output/part-r-00000'
    );
  }

  /**
   * Health check for Hadoop WebHDFS
   */
  async checkConnection() {
    return new Promise(resolve => {
      try {
        const url = new URL(config.hdfs.webHdfsUrl);
        const req = http.get(
          {
            hostname: url.hostname,
            port: url.port || 9870,
            path: '/webhdfs/v1/?op=GETHOMEDIRECTORY',
            timeout: config.hdfs.connectionTimeout
          },
          res => {
            if (res.statusCode >= 200 && res.statusCode < 400) {
              resolve({
                connected: true,
                url: config.hdfs.webHdfsUrl,
                status: 'ONLINE'
              });
            } else {
              resolve({
                connected: false,
                reason: `WebHDFS responded with HTTP ${res.statusCode}`,
                url: config.hdfs.webHdfsUrl
              });
            }
          }
        );

        req.on('error', err => {
          resolve({
            connected: false,
            reason: `WebHDFS unreachable at ${config.hdfs.webHdfsUrl} (${err.code || err.message})`,
            url: config.hdfs.webHdfsUrl
          });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({
            connected: false,
            reason: `WebHDFS connection timed out (${config.hdfs.connectionTimeout}ms)`,
            url: config.hdfs.webHdfsUrl
          });
        });
      } catch (err) {
        resolve({
          connected: false,
          reason: `Invalid WebHDFS URL: ${err.message}`,
          url: config.hdfs.webHdfsUrl
        });
      }
    });
  }

  /**
   * Parses Hadoop MapReduce output (standard tab-separated text)
   * Format: Category \t Month(YYYY-MM) \t TotalAmount \t MoMPercentChange \t AlertStatus
   * Example: Dining Out\t2026-02\t7800.00\t73.3%\tALERT_SURGE_GT_25
   */
  parseMapReduceOutput(rawContent) {
    if (!rawContent || typeof rawContent !== 'string') return [];

    const lines = rawContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    const records = [];

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        const category = parts[0].trim();
        const month = parts[1] ? parts[1].trim() : '';
        const totalAmount = parts[2] ? parseFloat(parts[2].trim()) : 0;
        const momPct = parts[3] ? parts[3].trim() : 'N/A';
        const alertStatus = parts[4] ? parts[4].trim() : 'NORMAL';

        records.push({
          category,
          month,
          totalAmount: isNaN(totalAmount) ? 0 : totalAmount,
          momPercentChange: momPct,
          alertStatus,
          isAlert: alertStatus.includes('ALERT')
        });
      }
    }

    return records;
  }

  /**
   * Loads MapReduce execution output from file system or HDFS
   */
  getMapReduceResults() {
    try {
      if (fs.existsSync(this.sampleOutputPath)) {
        const rawContent = fs.readFileSync(this.sampleOutputPath, 'utf8');
        const parsed = this.parseMapReduceOutput(rawContent);

        return {
          source: 'FILE_SYSTEM_OUTPUT (part-r-00000)',
          isHadoopCluster: false,
          filePath: this.sampleOutputPath,
          rawOutput: rawContent,
          records: parsed,
          recordCount: parsed.length,
          alertCount: parsed.filter(r => r.isAlert).length
        };
      }
    } catch (err) {
      console.error('Error reading MapReduce sample output:', err.message);
    }

    return {
      source: 'NOT_FOUND',
      isHadoopCluster: false,
      rawOutput: '',
      records: [],
      recordCount: 0,
      alertCount: 0
    };
  }
}

module.exports = new HdfsService();
