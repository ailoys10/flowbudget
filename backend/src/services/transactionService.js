const { v4: uuidv4 } = require('uuid');
const { db } = require('../models/database');

const getAll = (userId, filters = {}) => {
  let query = 'SELECT * FROM transactions WHERE user_id = ?';
  const params = [userId];

  if (filters.type && ['income', 'expense'].includes(filters.type)) {
    query += ' AND type = ?';
    params.push(filters.type);
  }

  if (filters.category) {
    query += ' AND category LIKE ?';
    params.push(`%${filters.category}%`);
  }

  if (filters.search) {
    query += ' AND title LIKE ?';
    params.push(`%${filters.search}%`);
  }

  if (filters.dateFrom) {
    query += ' AND date >= ?';
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    query += ' AND date <= ?';
    params.push(filters.dateTo);
  }

  query += ' ORDER BY date DESC, created_at DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(parseInt(filters.limit));
  }

  return db.prepare(query).all(...params);
};

const getById = (id, userId) => {
  const transaction = db.prepare(
    'SELECT * FROM transactions WHERE id = ? AND user_id = ?'
  ).get(id, userId);

  if (!transaction) {
    throw { status: 404, message: 'Transaction not found' };
  }

  return transaction;
};

const create = (userId, data) => {
  const id = uuidv4();
  const { title, amount, type, category, date } = data;

  db.prepare(`
    INSERT INTO transactions (id, user_id, title, amount, type, category, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, title, parseFloat(amount), type, category, date);

  return db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
};

const update = (id, userId, data) => {
  const existing = db.prepare(
    'SELECT * FROM transactions WHERE id = ? AND user_id = ?'
  ).get(id, userId);

  if (!existing) {
    throw { status: 404, message: 'Transaction not found' };
  }

  const { title, amount, type, category, date } = data;

  db.prepare(`
    UPDATE transactions
    SET title = ?, amount = ?, type = ?, category = ?, date = ?
    WHERE id = ? AND user_id = ?
  `).run(
    title || existing.title,
    amount ? parseFloat(amount) : existing.amount,
    type || existing.type,
    category || existing.category,
    date || existing.date,
    id,
    userId
  );

  return db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
};

const remove = (id, userId) => {
  const existing = db.prepare(
    'SELECT * FROM transactions WHERE id = ? AND user_id = ?'
  ).get(id, userId);

  if (!existing) {
    throw { status: 404, message: 'Transaction not found' };
  }

  db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, userId);
  return true;
};

// Analytics
const getSummary = (userId) => {
  const income = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions WHERE user_id = ? AND type = 'income'
  `).get(userId);

  const expense = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions WHERE user_id = ? AND type = 'expense'
  `).get(userId);

  const totalIncome = income.total;
  const totalExpense = expense.total;
  const balance = totalIncome - totalExpense;

  const transactionCount = db.prepare(
    'SELECT COUNT(*) as count FROM transactions WHERE user_id = ?'
  ).get(userId);

  return {
    totalIncome,
    totalExpense,
    balance,
    transactionCount: transactionCount.count,
  };
};

const getExpensesLast7Days = (userId) => {
  const results = db.prepare(`
    SELECT 
      date,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income
    FROM transactions
    WHERE user_id = ?
      AND date >= date('now', '-6 days')
    GROUP BY date
    ORDER BY date ASC
  `).all(userId);

  // Fill in missing days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const found = results.find(r => r.date === dateStr);
    days.push({
      date: dateStr,
      expenses: found ? found.expenses : 0,
      income: found ? found.income : 0,
    });
  }

  return days;
};

const getBalanceHistory = (userId) => {
  const results = db.prepare(`
    SELECT 
      date,
      SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net
    FROM transactions
    WHERE user_id = ?
    GROUP BY date
    ORDER BY date ASC
    LIMIT 30
  `).all(userId);

  let running = 0;
  return results.map(r => {
    running += r.net;
    return { date: r.date, balance: running };
  });
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
