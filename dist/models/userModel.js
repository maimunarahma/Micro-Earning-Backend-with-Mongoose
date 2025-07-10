"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    coin: {
        type: Number,
        min: 0,
        default: function () {
            return this.role === 'Buyer' ? 50 : this.role === 'Worker' ? 10 : 0;
        }
    },
    role: {
        type: String,
        required: true,
        enum: ["Buyer", "Worker", "Admin"]
    }
}, {
    versionKey: false
});
exports.User = (0, mongoose_1.model)("User", userSchema);
