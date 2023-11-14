// app.js
import express from "express";
import mongoose from "mongoose";
import apiRoute, { apiProtected } from "./routes/api.js";
import AuthMiddleware from "./middlewares/AuthMidleware.js";
import { DB_CONNECT, StatusCode } from "./utils/constants.js";
import cors from 'cors';

const app = express();
const PORT = 5000;

mongoose.connect(DB_CONNECT, { useNewUrlParser: true })
    .then(() => {
        console.log('Connected to the database');
    })
    .catch(error => {
        console.error('Error connecting to the database:', error);
    });

app.use(cors());
app.use(express.json());
app.use('/api/v1', apiRoute);
app.use('/api/v1', AuthMiddleware, apiProtected);

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
