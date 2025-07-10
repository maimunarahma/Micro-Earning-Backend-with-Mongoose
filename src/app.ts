
import express, { Application, Express, Request, Response } from 'express';
import { Task } from './models/taskModel';
import { User } from './models/userModel';
import { buffer } from 'stream/consumers';
import mongoose from 'mongoose';
const app: Application = express()
const cors = require('cors')
app.use(express.json());

app.use(cors({
    origin: ['http://localhost:5173', 'https://redux-mu-seven.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.get('/tasks', async (req: Request, res: Response) => {
    const task = await Task.find();
    res.status(201).json({
        success: true,
        message: "task retrived successfully",
        data: task
    })
})

app.post('/tasks', async (req: Request, res: Response) => {
    const task = new Task(req.body);

    const user = await User.findById(task.buyer)
    const totalAmount = Number(task?.payableAmount) * Number(task?.requiredWorker);
    if (Number(totalAmount) > Number(user?.coin)) {
        res.status(404).json({
            success: false,
            message: " not enough coin",

        })
    }
    // console.log(task)
    else {
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const currentCoin = Number(user.coin);
        user.coin = currentCoin - totalAmount;

        await user.save();
        await task.save()
        // console.log(user, task)
        res.status(201).json({
            success: true,
            message: "task added successfully",
            data: task
        })
    }

})
app.get('/users', async (req: Request, res: Response) => {
    const users = await User.find()
    res.status(201).json({
        success: true,
        message: " user retrived successfully",
        data: users
    })
})
app.post('/users', async (req: Request, res: Response) => {
    const user = new User(req.body)
    await user.save()
    res.status(201).json({
        success: true,
        message: "user added successfully",
        data: user
    })
})
// apply for a task as a worker by taskId
//worker apply for a task by giving his user.me data as request 
app.post('/apply-task/:id', async (req: Request, res: Response) => {

    const id = req.params.id;

    const task = await Task.findById(id)

    if (!task) {
        return res.status(404).json({
            success: false,
            message: "task noot found"
        })
    }
    const worker = req.body
    // console.log("worker is",worker)
    const isExistWorker = await User.findById(worker._id)
    console.log("isExist", isExistWorker)
    if (!isExistWorker) {
        res.status(400).json({
            success: false,
            message: "Worker not found"
        })
    }
    console.log(worker)
    if (!Array.isArray(task.workers)) {
        task.workers = [];
    }
    const alreadyApplied = task.workers.some(
        (w: any) => w?.user?.toString() === worker._id
    );
    if (alreadyApplied) {
        res.status(400).json({
            success: false,
            message: "worker alredy applied to this task"
        })
    }
    const applied = { user: worker._id, status: "pending" }
    task?.workers?.push(applied)

    await task.save()

    res.status(201).json({
        success: true,
        message: "worker applied",
        data: task
    })

})
//get workers all applied tasks by worker id
app.get('/my-submission/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    console.log(id)
    const task = await Task.find()
    const submitedTask = task.filter(t =>
        t?.workers?.some(w => w?.user.toString() === id)
    )
    console.log(submitedTask)
    res.status(201).json({
        success: true,
        message: "task fetched",
        data: submitedTask
    })
})
//task details
app.get('/tasks/:id', (async (req: Request, res: Response) => {
    const id = req.params.id;
    //   console.log(id)
    const task = await Task.findById(id)
    console.log(task)
    res.status(201).json({
        success: true,
        message: "task Found",
        data: task
    })
}))
//my tasks (buyers own  created task) 
app.get('/mytasks/:userid', async (req: Request, res: Response) => {
    const userId = req.params.userid;
    const myTasks = await Task.find({ buyer: userId })
    res.status(201).json({
        success: true,
        mesage: "Fetched Buyers Tasks successfully",
        data: myTasks
    })
    console.log(myTasks)
})
//    for updating status of a worker a buyer send request containing workerId and new_status .If status is approved 
//    worker will get coin as payableAmount for the task 
app.patch('/tasks/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const task = await Task.findById(id)
    const { user: workerId, status: update } = req.body;
    //   console.log("worker",workerId, update)
    const updateData = task?.workers.find(w =>
        w && w.user && w.user.toString() === workerId
    );

    console.log(updateData)
    if (!task) {
        return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!updateData) {
        res.status(404).json({
            success: false,
            message: "worker not found"
        })
    }
    if (updateData) {
        updateData.status = update;

    } else {
        return res.status(404).json({ message: "Worker not found." });
    }

    // updateData.status = update;
    if (update === 'approved') {
        const worker = await User.findById(workerId)
        if (worker && typeof worker.coin === "number" && typeof task?.payableAmount === "number") {
            worker.coin += task.payableAmount;
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid worker.coin or task.payableAmount"
            });
        }
        const buyer = await User.findById(task.buyer)
        if (Number(buyer?.coin) < Number(task?.payableAmount)) {
            res.status(404).json({
                success: false,
                message: "Buyer cant Pay , Purchase coins",

            })
        }
        if (buyer && typeof buyer.coin === "number" && typeof task?.payableAmount === "number") {
            buyer.coin -= task?.payableAmount;
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Invalid buyer.coin or task.payableAmount"
            });
        }
        await worker?.save()
        await buyer?.save()
        if (updateData) {
            updateData.status = update;
            task.workers = [updateData];
        } else {
            return res.status(404).json({ message: "Worker not found." });
        }

        await task.save();
        //  console.log(updateData)
        res.status(201).json({
            success: true,
            message: "worker status updated",
            data: task
        })
    }
    if (updateData) {
        updateData.status = update;
        task.workers = [updateData];
    } else {
        return res.status(404).json({ message: "Worker not found." });
    }

    await task.save();
    //  console.log(updateData)
    res.status(201).json({
        success: true,
        message: "worker status updated",
        data: task
    })
    //  const update=await Task.findByIdAndUpdate(id)

})
app.delete('/tasks/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const deleteTask = await Task.findByIdAndDelete(id)
    if (!deleteTask) {
        res.status(404).json({
            success: false,
            message: "task not found"
        })
    }
    else {
        res.status(201).json({
            success: true,
            message: " Task deleted ",
            data: deleteTask
        })
    }
})
app.get('/', (req: Request, res: Response) => {
    res.send('welcome to todo app')
})
export default app;


