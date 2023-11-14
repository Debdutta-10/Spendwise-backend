// addIncome.js
import { validationResult } from 'express-validator';
import { jsonGenerate } from '../utils/helpers.js';
import { StatusCode } from '../utils/constants.js';
import User from '../models/User.js';
import ExpenseSchema from '../models/ExpenseModel.js';

export const addExpense = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(StatusCode.VALIDATION_ERROR).json(jsonGenerate(StatusCode.VALIDATION_ERROR, "Expense is Required", errors.mapped()));
        }

        // Check if the user exists
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(StatusCode.NOT_FOUND).json(jsonGenerate(StatusCode.NOT_FOUND, "User not found"));
        }

        const { title, amount, category, description, date } = req.body;

        // Create a new income instance
        const expense = new ExpenseSchema({
            title,
            amount,
            category,
            description,
            date,
            userId: req.userId,
        });

        // Save the income
        await expense.save();

        // Update the user with the new income record
        user.expenses = user.expenses || [];
        user.expenses.push(expense._id);
        await user.save();

        console.log('Expense created successfully');
        return res.status(StatusCode.SUCCESS).json(jsonGenerate(StatusCode.SUCCESS, "Expense created successfully", expense));
    } catch (error) {
        console.error('Error in addExpense:', error);
        return res.status(StatusCode.UNPROCESSABLE_ENTITY).json(jsonGenerate(StatusCode.UNPROCESSABLE_ENTITY, "Something went wrong"));
    }
};

export const getExpense = async (req, res) => {
    try {
        // Check if the user exists
        const user = await User.findById(req.userId).select("-password").populate("expenses").exec();
        if (!user) {
            return res.status(StatusCode.NOT_FOUND).json(jsonGenerate(StatusCode.NOT_FOUND, "User not found"));
        }

        // Extract incomes from the user
        const expenses = user.expenses || [];

        console.log('Get expense list successfully');
        return res.status(StatusCode.SUCCESS).json(jsonGenerate(StatusCode.SUCCESS, "All expenses list", expenses));
    } catch (error) {
        console.error('Error in getIncome:', error);
        return res.status(StatusCode.UNPROCESSABLE_ENTITY).json(jsonGenerate(StatusCode.UNPROCESSABLE_ENTITY, "Something went wrong"));
    }
};

export const deleteExpense = async (req, res) => {
    try {
        const expenseId = req.body._id;

        if (!expenseId) {
            return res.json(jsonGenerate(StatusCode.VALIDATION_ERROR, "Expense id is required"));
        }

        const result = await ExpenseSchema.findOneAndDelete({
            userId: req.userId,
            _id: expenseId,
        });

        if (result) {
            const user = await User.findOneAndUpdate(
                {
                    _id: req.userId,
                },
                {
                    $pull: {
                        expenses: expenseId,
                    }
                }
            );
            return res.json(jsonGenerate(StatusCode.SUCCESS, "Expense deleted successfully", null));
        } else {
            return res.json(jsonGenerate(StatusCode.NOT_FOUND, "Expense not found", null));
        }
    } catch (error) {
        console.error('Error in deleteExpense:', error);
        return res.json(jsonGenerate(StatusCode.UNPROCESSABLE_ENTITY, "Could not delete", null));
    }
};
