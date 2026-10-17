const express = require('express');
const router = express.Router();
const Expense = require('../module/Expense');

router.post('/', async (req, res) => {
  try {
    const newExpense = new Expense(req.body);
    const savedExpense = await newExpense.save();


    res.status(201).json({
        message: 'Expense added successfully',
        
       data: savedExpense });
  } 
  
  catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.status(200).json({
      message: 'Expenses retrieved successfully',
      data: expenses
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
    try {
        const deletedExpense = await Expense.findByIdAndDelete(req.params.id);

        if (!deletedExpense) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            message: "Transaction deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


module.exports = router;