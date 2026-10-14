const express = require('express');
const multer = require('multer');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

// Multer storage for CSV file uploads (up to 25MB for real Kaggle datasets)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'text/plain' ||
      file.originalname.toLowerCase().endsWith('.csv')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .csv files are supported. Please ensure the file has a .csv extension.'));
    }
  }
});

router.get('/', expenseController.getExpenses);
router.post('/', expenseController.addExpense);
router.post('/inspect', upload.single('file'), expenseController.inspectCsv);
router.post('/upload', upload.single('file'), expenseController.uploadCsv);
router.get('/dataset-info', expenseController.getDatasetInfo);
router.post('/sample', expenseController.loadSampleData);
router.post('/reset-sample', expenseController.loadSampleData);
router.delete('/', expenseController.clearExpenses);

module.exports = router;
