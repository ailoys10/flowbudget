const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const transactionController = require('../controllers/transactionController');

// All routes protected with JWT middleware
router.use(authenticateToken);

// GET /transactions
router.get('/', transactionController.getAll);

// GET /transactions/:id
router.get('/:id', transactionController.getById);

// POST /transactions
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount')
      .isFloat({ gt: 0 })
      .withMessage('Amount must be a positive number'),
    body('type')
      .isIn(['income', 'expense'])
      .withMessage('Type must be income or expense'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('date').isISO8601().withMessage('Valid date is required (YYYY-MM-DD)'),
  ],
  transactionController.create
);

// PUT /transactions/:id
router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('amount')
      .optional()
      .isFloat({ gt: 0 })
      .withMessage('Amount must be a positive number'),
    body('type')
      .optional()
      .isIn(['income', 'expense'])
      .withMessage('Type must be income or expense'),
    body('category')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Category cannot be empty'),
    body('date').optional().isISO8601().withMessage('Valid date is required'),
  ],
  transactionController.update
);

// DELETE /transactions/:id
router.delete('/:id', transactionController.remove);

module.exports = router;
