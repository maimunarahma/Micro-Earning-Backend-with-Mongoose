import mongoose, { model, Schema } from "mongoose";
import { task, Workers } from "../interfaces/TaskInterface";



const workerSchema = new Schema<Workers>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"], // optional: limit values
            default: "pending",
        },
    },
    { _id: false } // disable auto _id generation for subdocs
);
const taskScherma = new Schema<task>({

    title: {
        type: String,
        required: true
    },
    payableAmount: {
        type: Number,
        required: true,
        min:0
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    requiredWorker: {
        type: Number,
        required: true
    },
    details: String,
    workers: {
        type:[workerSchema],
        default:[]
    }
},{
    versionKey:false
})

export const Task= model("Task", taskScherma)