const { validationResult } = require('express-validator');
const transactionService = require('../services/transactionService');

const getAll = (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      category: req.query.category,
      search: req.query.search,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      limit: req.query.limit,
    };

    const transactions = transactionService.getAll(req.user.userId, filters);
    return res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: transactions,
      total: transactions.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getById = (req, res) => {
  try {
    const transaction = transactionService.getById(req.params.id, req.user.userId);
    return res.status(200).json({
      success: true,
      message: 'Transaction retrieved successfully',
      data: transaction,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};

const create = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const transaction = transactionService.create(req.user.userId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};

const update = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const transaction = transactionService.update(req.params.id, req.user.userId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};

const remove = (req, res) => {
  try {
    transactionService.remove(req.params.id, req.user.userId);
    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};

// Analytics controllers
const getSummary = (req, res) => {
  try {
    const summary = transactionService.getSummary(req.user.userId);
    return res.status(200).json({
      success: true,
      message: 'Summary retrieved successfully',
      data: summary,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getExpensesLast7Days = (req, res) => {
  try {
    const data = transactionService.getExpensesLast7Days(req.user.userId);
    return res.status(200).json({
      success: true,
      message: 'Expenses data retrieved successfully',
      data,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getBalanceHistory = (req, res) => {
  try {
    const data = transactionService.getBalanceHistory(req.user.userId);
    return res.status(200).json({
      success: true,
      message: 'Balance history retrieved successfully',
      data,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getSummary,
  getExpensesLast7Days,
  getBalanceHistory,
};
