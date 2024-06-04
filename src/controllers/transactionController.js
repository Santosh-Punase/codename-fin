import Transaction from '../models/Transaction.js';

const DEFAULT_DATE = new Date().toISOString();

export const addTransaction = async (req, res) => {
  const {
    amount, remark, category, date = DEFAULT_DATE,
  } = req.body;
  try {
    const transaction = new Transaction({
      user: req.user.id,
      amount,
      remark,
      category,
      date,
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const {
    amount, remark, category, date = DEFAULT_DATE,
  } = req.body;
  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    transaction.amount = amount;
    transaction.remark = remark;
    transaction.category = category;
    transaction.date = date;
    await transaction.save();
    return res.status(200).json(transaction);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await transaction.deleteOne();
    return res.status(200).json({ message: 'Transaction deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
