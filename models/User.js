import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name:{
        type:String,
    },
    username:{
        type:String,
        min:6,
        max:32,
        required: true,
    },
    password:{
        type:String,
        min:6,
        max:32,
        required: true,
    },
    email:{
        type:String,
        min:6,
        max:32,
    },
    incomes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Income"
        }
    ],
    expenses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Expense"
        }
    ],
    date:{
        type:Date,
        default: Date.now,
    }
})

export default mongoose.model("User",userSchema)