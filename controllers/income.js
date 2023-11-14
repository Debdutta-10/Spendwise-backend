// addIncome.js
import { validationResult } from 'express-validator';
import { jsonGenerate } from '../utils/helpers.js';
import { StatusCode } from '../utils/constants.js';
import User from '../models/User.js';
import IncomeSchema from '../models/IncomeModel.js';

export const addIncome = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(StatusCode.VALIDATION_ERROR).json(jsonGenerate(StatusCode.VALIDATION_ERROR, "Income is Required", errors.mapped()));
        }

        // Check if the user exists
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(StatusCode.NOT_FOUND).json(jsonGenerate(StatusCode.NOT_FOUND, "User not found"));
        }

        const { title, amount, category, description, date } = req.body;

        // Create a new income instance
        const income = new IncomeSchema({
            title,
            amount,
            category,
            description,
            date,
            userId: req.userId,
        });

        // Save the income
        await income.save();

        // Update the user with the new income record
        user.incomes = user.incomes || [];
        user.incomes.push(income._id);
        await user.save();

        console.log('Income created successfully');
        return res.status(StatusCode.SUCCESS).json(jsonGenerate(StatusCode.SUCCESS, "Income created successfully", income));
    } catch (error) {
        console.error('Error in addIncome:', error);
        return res.status(StatusCode.UNPROCESSABLE_ENTITY).json(jsonGenerate(StatusCode.UNPROCESSABLE_ENTITY, "Something went wrong"));
    }
};

export const getIncome = async (req, res) => {
    try {
        // Check if the user exists
        const user = await User.findById(req.userId).select("-password").populate("incomes").exec();
        if (!user) {
            return res.status(StatusCode.NOT_FOUND).json(jsonGenerate(StatusCode.NOT_FOUND, "User not found"));
        }

        // Extract incomes from the user
        const incomes = user.incomes || [];

        console.log('Get Income list successfully');
        return res.status(StatusCode.SUCCESS).json(jsonGenerate(StatusCode.SUCCESS, "All Income list", incomes));
    } catch (error) {
        console.error('Error in getIncome:', error);
        return res.status(StatusCode.UNPROCESSABLE_ENTITY).json(jsonGenerate(StatusCode.UNPROCESSABLE_ENTITY, "Something went wrong"));
    }
};

export const deleteIncome = async (req, res) => {
    try {
        const incomeId = req.body._id;

        if (!incomeId) {
            return res.json(jsonGenerate(StatusCode.VALIDATION_ERROR, "Income id is required"));
        }

        const result = await IncomeSchema.findOneAndDelete({
            userId: req.userId,
            _id: incomeId,
        });

        if (result) {
            const user = await User.findOneAndUpdate(
                {
                    _id: req.userId,
                },
                {
                    $pull: {
                        incomes: incomeId,
                    }
                }
            );
            return res.json(jsonGenerate(StatusCode.SUCCESS, "Income deleted successfully", null));
        } else {
            return res.json(jsonGenerate(StatusCode.NOT_FOUND, "Income not found", null));
        }
    } catch (error) {
        console.error('Error in deleteIncome:', error);
        return res.json(jsonGenerate(StatusCode.UNPROCESSABLE_ENTITY, "Could not delete", null));
    }
};
