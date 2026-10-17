const express = require('express');
const router = express.Router();
const Expense = require('../module/Expense');

// GET: All expenses with filtering, search, and sorting
router.get('/', async (req, res) => {
  try {
    const { search, type, category, startDate, endDate, sortBy } = req.query;

    const query = {};

    // Filter by type (income or expense)
    if (type && type !== 'all') {
      query.type = type;
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search by title or category
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Sorting
    let sortOption = { date: -1 }; // default newest first
    if (sortBy === 'oldest') {
      sortOption = { date: 1 };
    } else if (sortBy === 'highest') {
      sortOption = { amount: -1 };
    } else if (sortBy === 'lowest') {
      sortOption = { amount: 1 };
    }

    const expenses = await Expense.find(query).sort(sortOption);

    res.status(200).json({
      message: 'Expenses retrieved successfully',
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Add new expense
router.post('/', async (req, res) => {
  try {
    const newExpense = new Expense(req.body);
    const savedExpense = await newExpense.save();

    res.status(201).json({
      message: 'Expense added successfully',
      data: savedExpense
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT: Update / Edit existing expense by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({
      message: 'Transaction updated successfully',
      data: updatedExpense
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Remove expense by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);

    if (!deletedExpense) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;