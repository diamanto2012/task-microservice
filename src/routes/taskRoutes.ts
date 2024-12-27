import express, { Router, Request, Response } from 'express';
import { TaskController } from '../controllers/taskController';

const router = Router();
const taskController = new TaskController();

// Create task
router.post('/tasks', async (req: Request, res: Response): Promise<void> => {
    try {
        await taskController.create(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при создании задачи' });
    }
});

// Get tasks
router.get('/tasks', async (req: Request, res: Response): Promise<void> => {
    try {
        await taskController.getTasks(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении задач' });
    }
});

// Update task
router.put('/tasks/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        await taskController.update(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при обновлении задачи' });
    }
});

// Delete tasks
router.delete('/tasks', async (req: Request, res: Response): Promise<void> => {
    try {
        await taskController.delete(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при удалении задач' });
    }
});

// Default route
router.get('/', (_req: Request, res: Response) => {
    res.send('Welcome to the API!'); // Обработка корневого маршрута
});

export default router;