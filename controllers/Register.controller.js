import { validationResult } from "express-validator";
import { jsonGenerate } from "../utils/helpers.js";
import User from "../models/User.js";
import { StatusCode, JWT_TOKEN_SECRET } from "../utils/constants.js";
import bcrypt from 'bcrypt';
import Jwt from 'jsonwebtoken';

const Register = async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        const { name, username, password, email } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const userExists = await User.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        });

        if (userExists) {
            return res.status(StatusCode.UNPROCESSABLE_ENTITY).json("User or email already exists");
        }

        // Save to the database
        try {
            const result = await User.create({
                name: name,
                email: email,
                password: hashPassword,
                username: username
            });

            const token = Jwt.sign({ userId: result._id }, JWT_TOKEN_SECRET);

            return res.json(jsonGenerate(StatusCode.SUCCESS, "Registration Successful", { userId: result._id, token: token }));
        } catch (error) {
            console.log(error);
        }
    } else {
        return res.status(StatusCode.VALIDATION_ERROR).json(jsonGenerate(StatusCode.VALIDATION_ERROR, "Validation error", errors.mapped()));
    }
}

export default Register;
