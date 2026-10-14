const express = require('express');
const multer = require('multer');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

// In-memory multer storage for CSV file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.toLowerCase().endsWith('.csv')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .csv files are supported'));
    }
  }
});

router.get('/', expenseController.getExpenses);
router.post('/', expenseController.addExpense);
router.post('/upload', upload.single('file'), expenseController.uploadCsv);
router.post('/sample', expenseController.loadSampleData);
router.delete('/', expenseController.clearExpenses);

module.exports = router;
