"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const data_source_1 = require("../../config/data.source");
const task_1 = require("../../db/models/task");
const task_validation_1 = require("../validations/task.validation");
const taskService_1 = require("../../services/taskService");
const taskService = new taskService_1.TaskService();
class TaskController {
    constructor() {
        this.taskRepository = data_source_1.AppDataSource.getRepository(task_1.Task);
    }
    async create(req, res) {
        try {
            const { error } = task_validation_1.taskValidation.createTask.body.validate(req.body);
            if (error) {
                const errors = error.details.map((detail) => ({
                    path: detail.path.map((p) => String(p)),
                    message: detail.message
                }));
                res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors
                });
                return;
            }
            const task = await taskService.createTask(req.body.title, req.body.description, req.body.user_id);
            res.status(201).json({ id: task.id });
            return;
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
                return;
            }
            else {
                res.status(500).json({ error: 'Unexpected error occurred' });
                return;
            }
        }
    }
    async getTasks(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        try {
            const result = await taskService.getTasks(page, limit);
            res.status(200).json(result);
            return;
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
                return;
            }
            else {
                res.status(500).json({ error: 'Unexpected error occurred' });
                return;
            }
        }
    }
    async update(req, res) {
        try {
            const { error } = task_validation_1.taskValidation.updateTask.body.validate(req.body);
            if (error) {
                const errors = error.details.map((detail) => ({
                    path: detail.path.map((p) => String(p)),
                    message: detail.message
                }));
                res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors
                });
                return;
            }
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid task ID' });
                return;
            }
            try {
                await taskService.updateTaskStatus(id, req.body.status);
                res.status(200).json({ message: 'Task updated successfully' });
                return;
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(500).json({ error: error.message });
                    return;
                }
                else {
                    res.status(500).json({ error: 'Unexpected error occurred' });
                    return;
                }
            }
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
                return;
            }
            else {
                res.status(500).json({ error: 'Unexpected error occurred' });
                return;
            }
        }
    }
    async delete(req, res) {
        try {
            const { error } = task_validation_1.taskValidation.deleteTask.params.validate(req.params);
            if (error) {
                const errors = error.details.map((detail) => ({
                    path: detail.path.map((p) => String(p)),
                    message: detail.message
                }));
                res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors
                });
                return;
            }
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid task ID' });
                return;
            }
            try {
                await taskService.deleteTasks([id]);
                res.status(200).json({ message: 'Task deleted successfully' });
                return;
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(500).json({ error: error.message });
                    return;
                }
                else {
                    res.status(500).json({ error: 'Unexpected error occurred' });
                    return;
                }
            }
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
                return;
            }
            else {
                res.status(500).json({ error: 'Unexpected error occurred' });
                return;
            }
        }
    }
    async deleteTasks(req, res) {
        try {
            const { error } = task_validation_1.taskValidation.deleteTasks.body.validate(req.body);
            if (error) {
                const errors = error.details.map((detail) => ({
                    path: detail.path.map((p) => String(p)),
                    message: detail.message
                }));
                res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors
                });
                return;
            }
            const { ids } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) {
                res.status(400).json({ error: 'Invalid task IDs. Expected non-empty array of IDs.' });
                return;
            }
            try {
                await taskService.deleteTasks(ids);
                res.status(200).json({ message: 'Tasks deleted successfully' });
                return;
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(500).json({ error: error.message });
                    return;
                }
                else {
                    res.status(500).json({ error: 'Unexpected error occurred' });
                    return;
                }
            }
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
                return;
            }
            else {
                res.status(500).json({ error: 'Unexpected error occurred' });
                return;
            }
        }
    }
}
exports.TaskController = TaskController;
