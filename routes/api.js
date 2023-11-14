import express from "express";
import { check } from "express-validator";
import { LoginSchema } from "../validationSchema/LoginSchema.js";
import Login from "../controllers/Login.controller.js";
import Register from "../controllers/Register.controller.js";
import { RegisterSchema } from "../validationSchema/RegisterSchema.js";
import { addIncome, deleteIncome, getIncome } from "../controllers/income.js";
import { addExpense, deleteExpense, getExpense } from "../controllers/expense.js";
const apiRoute = express.Router();
export const apiProtected = express.Router();

//Login and Register
apiRoute.post('/register',RegisterSchema,Register);
apiRoute.post('/login',LoginSchema,Login);

//Protected Income
apiProtected.post('/add-income',[check("amount", "Amount is required").exists()],addIncome);
apiProtected.get('/get-income',[check("amount", "Amount is required").exists()],getIncome);
apiProtected.post('/delete-income',[check("amount", "Amount is required").exists()],deleteIncome);

//Protected Expense
apiProtected.post('/add-expense',[check("amount", "Amount is required").exists()],addExpense);
apiProtected.get('/get-expense',[check("amount", "Amount is required").exists()],getExpense);
apiProtected.post('/delete-expense',[check("amount", "Amount is required").exists()],deleteExpense);

export default apiRoute;