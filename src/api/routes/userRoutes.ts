import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();
const userController = new UserController();

// Create user
router.post('/users', async (req, res) => {
    await userController.create(req, res);
});

// Get all users
router.get('/users', async (req, res) => {
    await userController.getUsers(req, res);
});

// Get single user
router.get('/users/:id', async (req, res) => {
    await userController.getUser(req, res);
});

// Update user
router.put('/users/:id', async (req, res) => {
    await userController.update(req, res);
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    await userController.delete(req, res);
});

export default router;
