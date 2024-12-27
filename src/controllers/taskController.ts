import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';
import express from 'express';



const taskService = new TaskService();

export class TaskController {
    async create(req: Request, res: Response) {        
        const { title, description, user_id } = req.body;
        // console.log('Received body:', req); // Логируем тело запроса для отладки

        try {
            const task = await taskService.createTask(title, description, user_id);
            res.status(201).json({ id: task.id });
        } catch (error) {
            if (error instanceof Error) {
                // Теперь TypeScript знает, что error - это экземпляр Error
                res.status(500).json({ error: error.message });
            } else {
                // Обработка других типов ошибок
                res.status(500).json({ error: 'Unexpected error occurred' });
            }
        
        }
    }

    async getTasks(req: Request, res: Response) {
        const page = parseInt(req.query.page as string) || 1; // Получаем номер страницы из query параметров
        const limit = parseInt(req.query.limit as string) || 10; // Получаем лимит из query параметров

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

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        try {
            const updatedTask = await taskService.updateTaskStatus(id, status);
            res.status(200).json(updatedTask);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('not found')) {
                    res.status(404).json({ error: error.message });
                } else if (error.message.includes('Invalid status')) {
                    res.status(400).json({ error: error.message });
                } else {
                    res.status(500).json({ error: error.message });
                }
            } else {
                res.status(500).json({ error: 'Unexpected error occurred' });
            }
        }
    }

    

    async delete(req: Request, res: Response) {
        const { ids } = req.body; // Получаем массив идентификаторов из тела запроса

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Invalid input: ids must be a non-empty array' });
        }

        try {
            await taskService.deleteTasks(ids);
            res.status(204).send(); // Успешное удаление, возвращаем статус 204 No Content
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Unexpected error occurred' });
            }
        }
    }
};