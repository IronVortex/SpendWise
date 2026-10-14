const express = require('express');
const router = express.Router();
const bigDataController = require('../controllers/bigDataController');

router.get('/status', bigDataController.getPipelineStatus);
router.post('/stream', bigDataController.streamToKafka);
router.get('/stream/logs', bigDataController.getStreamLogs);
router.get('/mapreduce-output', bigDataController.getMapReduceResults);

module.exports = router;
