const mongoose = require("mongoose");

// ********** SCHEMA **********
// Define a schema first (so we can also later define a middleware and other stuff).
const taskSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            trim: true,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User" // Relationship to another model.
        }
    },
    // OPTIONS.
    {
        // Add `createdAt` and `updatedAt`.
        timestamps: true
    }
);

// ********** MODEL **********
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
