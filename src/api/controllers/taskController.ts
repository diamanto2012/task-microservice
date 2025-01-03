import { Request, Response } from 'express';
import { AppDataSource } from '../../config/data.source';
import { Task } from '../../db/models/task';
import { taskValidation } from '../validations/task.validation';
import { TaskService } from '../../services/taskService';
import { ValidationErrorItem } from 'joi';

const taskService = new TaskService();

export class TaskController {
    private taskRepository = AppDataSource.getRepository(Task);

    async create(req: Request, res: Response): Promise<void> {
        try {
            const { error } = taskValidation.createTask.body.validate(req.body);
            if (error) {
                const errors = error.details.map((detail: ValidationErrorItem) => ({
                    path: detail.path.map((p: string | number) => String(p)),
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
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
                return;
            } else {
                res.status(500).json({ error: 'Unexpected error occurred' });
                return;
            }
        }
    }

    async getTasks(req: Request, res: Response): Promise<void> {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        try {
            const result = await taskService.getTasks(page, limit);
            res.status(200).json(result);
            return;
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
                return;
            } else {
                res.status(500).json({ error: 'Unexpected error occurred' });
                return;
            }
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const { error } = taskValidation.updateTask.body.validate(req.body);
            if (error) {
                const errors = error.details.map((detail: ValidationErrorItem) => ({
                    path: detail.path.map((p: string | number) => String(p)),
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
            } catch (error) {
                if (error instanceof Error) {
                    res.status(500).json({ error: error.message });
                    return;
                } else {
                    res.status(500).json({ error: 'Unexpected error occurred' });
                    return;
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
                return;
            } else {
                res.status(500).json({ error: 'Unexpected error occurred' });
                return;
            }
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { error } = taskValidation.deleteTask.params.validate(req.params);
            if (error) {
                const errors = error.details.map((detail: ValidationErrorItem) => ({
                    path: detail.path.map((p: string | number) => String(p)),
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
            } catch (error) {
                if (error instanceof Error) {
                    res.status(500).json({ error: error.message });
                    return;
                } else {
                    res.status(500).json({ error: 'Unexpected error occurred' });
                    return;
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
                return;
            } else {
                res.status(500).json({ error: 'Unexpected error occurred' });
                return;
            }
        }
    }

    async deleteTasks(req: Request, res: Response): Promise<void> {
        try {
            const { error } = taskValidation.deleteTasks.body.validate(req.body);
            if (error) {
                const errors = error.details.map((detail: ValidationErrorItem) => ({
                    path: detail.path.map((p: string | number) => String(p)),
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
            } catch (error) {
                if (error instanceof Error) {
                    res.status(500).json({ error: error.message });
                    return;
                } else {
                    res.status(500).json({ error: 'Unexpected error occurred' });
                    return;
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
                return;
            } else {
                res.status(500).json({ error: 'Unexpected error occurred' });
                return;
            }
        }
    }
}
