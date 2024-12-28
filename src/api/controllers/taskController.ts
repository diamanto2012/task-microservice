import { Request, Response } from 'express';
import { TaskService } from '../../services/taskService';

const taskService = new TaskService();

export class TaskController {
    async create(req: Request, res: Response) {        
        const { title, description, user_id } = req.body;

        try {
            const task = await taskService.createTask(title, description, user_id);
            res.status(201).json({ id: task.id });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Unexpected error occurred' });
            }
        }
    }

    async getTasks(req: Request, res: Response) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        try {
            const result = await taskService.getTasks(page, limit);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Unexpected error occurred' });
            }
        }
    }

    async update(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        const { status } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }

        try {
            await taskService.updateTaskStatus(id, status);
            res.status(200).json({ message: 'Task updated successfully' });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Unexpected error occurred' });
            }
        }
    }

    async delete(req: Request, res: Response) {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }

        try {
            await taskService.deleteTasks([id]);
            res.status(200).json({ message: 'Task deleted successfully' });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Unexpected error occurred' });
            }
        }
    }

    async deleteTasks(req: Request, res: Response) {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Invalid task IDs. Expected non-empty array of IDs.' });
        }

        try {
            await taskService.deleteTasks(ids);
            res.status(200).json({ message: 'Tasks deleted successfully' });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Unexpected error occurred' });
            }
        }
    }
}
