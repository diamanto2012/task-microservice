import { Router, Request, Response } from 'express';
import { TaskController } from '../controllers/taskController';

const router = Router();
const taskController = new TaskController();

// Create task
router.post('/tasks', async (req: Request, res: Response): Promise<void> => {
    try {
        await taskController.create(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Error creating task' });
    }
});

// Get tasks
router.get('/tasks', async (req: Request, res: Response): Promise<void> => {
    try {
        await taskController.getTasks(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Error getting tasks' });
    }
});

// Update task
router.put('/tasks/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        await taskController.update(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Error updating task' });
    }
});

// Delete single task
router.delete('/tasks/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        await taskController.delete(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Error deleting task' });
    }
});

// Delete multiple tasks
router.delete('/tasks', async (req: Request, res: Response): Promise<void> => {
    try {
        await taskController.deleteTasks(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Error deleting tasks' });
    }
});

export default router;
