"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskModel_1 = require("./models/taskModel");
const userModel_1 = require("./models/userModel");
const app = (0, express_1.default)();
const cors = require('cors');
app.use(express_1.default.json());
app.use(cors({
    origin: ['http://localhost:5173', 'https://redux-mu-seven.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.get('/tasks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield taskModel_1.Task.find();
    res.status(201).json({
        success: true,
        message: "task retrived successfully",
        data: task
    });
}));
app.post('/tasks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const task = new taskModel_1.Task(req.body);
    const user = yield userModel_1.User.findById(task.buyer);
    const totalAmount = Number(task === null || task === void 0 ? void 0 : task.payableAmount) * Number(task === null || task === void 0 ? void 0 : task.requiredWorker);
    if (Number(totalAmount) > Number(user === null || user === void 0 ? void 0 : user.coin)) {
        res.status(404).json({
            success: false,
            message: " not enough coin",
        });
    }
    // console.log(task)
    else {
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const currentCoin = Number(user.coin);
        user.coin = currentCoin - totalAmount;
        yield user.save();
        yield task.save();
        // console.log(user, task)
        res.status(201).json({
            success: true,
            message: "task added successfully",
            data: task
        });
    }
}));
app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield userModel_1.User.find();
    res.status(201).json({
        success: true,
        message: " user retrived successfully",
        data: users
    });
}));
app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = new userModel_1.User(req.body);
    yield user.save();
    res.status(201).json({
        success: true,
        message: "user added successfully",
        data: user
    });
}));
// apply for a task as a worker by taskId
app.post('/apply-task/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const task = yield taskModel_1.Task.findById(id);
    console.log(task);
    if (!task) {
        return res.status(404).json({
            success: false,
            message: "task noot found"
        });
    }
    const worker = req.body;
    const isExistWorker = yield userModel_1.User.findById(worker.user);
    if (!isExistWorker) {
        res.status(400).json({
            success: false,
            message: "Worker not found"
        });
    }
    console.log(worker);
    if (!Array.isArray(task.workers)) {
        task.workers = [];
    }
    const alreadyApplied = task.workers.some((w) => w.user.toString() === worker.user);
    if (alreadyApplied) {
        res.status(400).json({
            success: false,
            message: "worker alredy applied to this task"
        });
    }
    task.workers.push(worker);
    yield task.save();
    res.status(201).json({
        success: true,
        message: "worker applied",
        data: task
    });
}));
//get workers all applied tasks by worker id
app.get('/my-submission/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    console.log(id);
    const task = yield taskModel_1.Task.find();
    const submitedTask = task.filter(t => { var _a; return (_a = t === null || t === void 0 ? void 0 : t.workers) === null || _a === void 0 ? void 0 : _a.some(w => (w === null || w === void 0 ? void 0 : w.user.toString()) === id); });
    console.log(submitedTask);
    res.status(201).json({
        success: true,
        message: "task fetched",
        data: submitedTask
    });
}));
//task details
app.get('/tasks/:id', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    //   console.log(id)
    const task = yield taskModel_1.Task.findById(id);
    console.log(task);
    res.status(201).json({
        success: true,
        message: "task Found",
        data: task
    });
})));
//my tasks (buyers own  created task) 
app.get('/mytasks/:userid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userid;
    const myTasks = yield taskModel_1.Task.find({ buyer: userId });
    res.status(201).json({
        success: true,
        mesage: "Fetched Buyers Tasks successfully",
        data: myTasks
    });
    console.log(myTasks);
}));
app.patch('/tasks/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const task = yield taskModel_1.Task.findById(id);
    const { user: workerId, status: update } = req.body;
    //   console.log("worker",workerId, update)
    const updateData = task === null || task === void 0 ? void 0 : task.workers.find(w => w && w.user && w.user.toString() === workerId);
    console.log(updateData);
    if (!task) {
        return res.status(404).json({ success: false, message: "Task not found" });
    }
    if (!updateData) {
        res.status(404).json({
            success: false,
            message: "worker not found"
        });
    }
    if (updateData) {
        updateData.status = update;
    }
    else {
        return res.status(404).json({ message: "Worker not found." });
    }
    // updateData.status = update;
    if (update === 'approved') {
        const worker = yield userModel_1.User.findById(workerId);
        if (worker && typeof worker.coin === "number" && typeof (task === null || task === void 0 ? void 0 : task.payableAmount) === "number") {
            worker.coin += task.payableAmount;
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Invalid worker.coin or task.payableAmount"
            });
        }
        const buyer = yield userModel_1.User.findById(task.buyer);
        if (Number(buyer === null || buyer === void 0 ? void 0 : buyer.coin) < Number(task === null || task === void 0 ? void 0 : task.payableAmount)) {
            res.status(404).json({
                success: false,
                message: "Buyer cant Pay , Purchase coins",
            });
        }
        if (buyer && typeof buyer.coin === "number" && typeof (task === null || task === void 0 ? void 0 : task.payableAmount) === "number") {
            buyer.coin -= task === null || task === void 0 ? void 0 : task.payableAmount;
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Invalid buyer.coin or task.payableAmount"
            });
        }
        yield (worker === null || worker === void 0 ? void 0 : worker.save());
        yield (buyer === null || buyer === void 0 ? void 0 : buyer.save());
        if (updateData) {
            updateData.status = update;
            task.workers = [updateData];
        }
        else {
            return res.status(404).json({ message: "Worker not found." });
        }
        yield task.save();
        //  console.log(updateData)
        res.status(201).json({
            success: true,
            message: "worker status updated",
            data: task
        });
    }
    if (updateData) {
        updateData.status = update;
        task.workers = [updateData];
    }
    else {
        return res.status(404).json({ message: "Worker not found." });
    }
    yield task.save();
    //  console.log(updateData)
    res.status(201).json({
        success: true,
        message: "worker status updated",
        data: task
    });
    //  const update=await Task.findByIdAndUpdate(id)
}));
app.delete('/tasks/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const deleteTask = yield taskModel_1.Task.findByIdAndDelete(id);
    if (!deleteTask) {
        res.status(404).json({
            success: false,
            message: "task not found"
        });
    }
    else {
        res.status(201).json({
            success: true,
            message: " Task deleted ",
            data: deleteTask
        });
    }
}));
app.get('/', (req, res) => {
    res.send('welcome to todo app');
});
exports.default = app;
