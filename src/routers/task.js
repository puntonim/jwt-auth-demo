const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();

// POST /tasks.
router.post("/tasks", auth, async (req, res) => {
    const task = new Task({ ...req.body, owner: req.user._id });
    try {
        await task.save();
    } catch (e) {
        res.status(400).send(e);
    }
    res.status(201).send(task);
});

// GET /tasks?completed=true.
// GET /tasks?limit=10&skip=10.
// GET /tasks?sortBy=createdAt:asc.
router.get("/tasks", auth, async (req, res) => {
    const match = {};
    if (req.query.completed) {
        // `req.query.completed` is not bool, but always a string.
        match.completed = req.query.completed === "true";
    }

    const sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1; // 1 for asc, -1 for desc.
    }

    try {
        // tasks = await Task.find({ owner: req.user._id });
        // Using the inverse relationship.
        await req.user
            .populate({
                path: "tasks",
                match,
                // Note: this same `options` arg could be used in a regular `find()` query.
                options: {
                    limit: parseInt(req.query.limit), // Ignored by Mongoose if NaN.
                    skip: parseInt(req.query.skip), // Ignored by Mongoose if NaN.
                    sort
                }
            })
            .execPopulate();
    } catch (e) {
        res.status(500).send();
    }
    res.send(req.user.tasks);
});

// GET /tasks/:id.
router.get("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;
    let task;

    try {
        task = await Task.findOne({ _id, owner: req.user._id });
    } catch (e) {
        res.status(500).send();
    }

    if (!task) {
        return res.status(404).send();
    }
    res.send(task);
});

// PATCH /tasks/:id.
router.patch("/tasks/:id", auth, async (req, res) => {
    // Ensure only valid keys are sent.
    const allowedUpdates = ["description", "completed"];
    const updates = Object.keys(req.body);
    const isValidOp = updates.every(key => allowedUpdates.includes(key));
    if (!isValidOp) {
        return res.status(400).send({ error: "Invalid update keys" });
    }

    const task = await Task.findOne({
        _id: req.params.id,
        owner: req.user._id
    });
    if (!task) {
        return res.status(404).send();
    }

    updates.forEach(key => (task[key] = req.body[key]));
    try {
        await task.save();
    } catch (e) {
        // Validation error.
        if (false) {
            // TODO; not sure how to catch this yet!
            return res.status(400).send(e);
        }
        // Generic error.
        res.status(500).send();
    }
    res.send(task);
});

// DELETE /tasks/:id.
router.delete("/tasks/:id", auth, async (req, res) => {
    let task;
    try {
        task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });
    } catch (e) {
        res.status(500).send();
    }
    if (!task) {
        return res.status(404).send();
    }
    res.send(task);
});

module.exports = router;
