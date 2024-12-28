"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const router = (0, express_1.Router)();
const taskController = new taskController_1.TaskController();
// Create task
router.post('/tasks', async (req, res) => {
    try {
        await taskController.create(req, res);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating task' });
    }
});
// Get tasks
router.get('/tasks', async (req, res) => {
    try {
        await taskController.getTasks(req, res);
    }
    catch (error) {
        res.status(500).json({ error: 'Error getting tasks' });
    }
});
// Update task
router.put('/tasks/:id', async (req, res) => {
    try {
        await taskController.update(req, res);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating task' });
    }
});
// Delete single task
router.delete('/tasks/:id', async (req, res) => {
    try {
        await taskController.delete(req, res);
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting task' });
    }
});
// Delete multiple tasks
router.delete('/tasks', async (req, res) => {
    try {
        await taskController.deleteTasks(req, res);
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting tasks' });
    }
});
exports.default = router;
