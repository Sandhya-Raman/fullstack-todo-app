const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Apply authentication to all task routes
router.use(authMiddleware);

// Add a new task
router.post("/", async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        const task = new Task({
            title,
            description,
            user: req.user.id
        });

        await task.save();

        res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create task"
        });
    }
});

// Get all tasks belonging to logged-in user
router.get("/", async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.user.id
        }).sort({ createdAt: -1 });

        res.status(200).json({ tasks });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch tasks"
        });
    }
});

// Update a task
router.put("/:id", async (req, res) => {
    try {
        const { title, description, completed } = req.body;

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const updates = {};

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({
                    message: "Task title cannot be empty"
                });
            }
            updates.title = title.trim();
        }

        if (description !== undefined) {
            updates.description = description;
        }

        if (completed !== undefined) {
            updates.completed = completed;
        }

        const task = await Task.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id
            },
            updates,
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json({
            message: "Task updated successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update task"
        });
    }
});

// Delete a task
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete task"
        });
    }
});

module.exports = router;