import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import PaymentMode from '../models/PaymentMode.js';

// eslint-disable-next-line import/prefer-default-export
export const getAccountSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {
      if (transaction._id === 'income') {
        totalIncome = transaction.total;
      } else if (transaction._id === 'expense') {
        totalExpense = transaction.total;
      }
    });

    const categories = await Category.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$budget' },
          totalExpenditure: { $sum: '$expenditure' },
        },
      },
    ]);

    const totalBudget = categories[0] ? categories[0].totalBudget : 0;
    const totalExpenditure = categories[0] ? categories[0].totalExpenditure : 0;

    const paymentModes = await PaymentMode.find({ user: userId }).lean();
    const paymentModeBalances = paymentModes.map((mode) => ({
      name: mode.name,
      balance: mode.balance,
    }));

    const netAccountBalance = totalIncome - totalExpense;

    res.json({
      netAccountBalance,
      totalSpent: totalExpense,
      totalMonthlyBudget: totalBudget,
      totalMonthlyExpenditure: totalExpenditure,
      paymentModes: paymentModeBalances,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
