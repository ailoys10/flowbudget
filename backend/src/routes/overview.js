const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const transactionController = require('../controllers/transactionController');

// All routes protected with JWT middleware
router.use(authenticateToken);

// GET /overview/summary
router.get('/summary', transactionController.getSummary);

// GET /overview/expenses-last-7-days
router.get('/expenses-last-7-days', transactionController.getExpensesLast7Days);

// GET /overview/balance-history
router.get('/balance-history', transactionController.getBalanceHistory);

module.exports = router;
