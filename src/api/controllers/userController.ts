import { Request, Response } from 'express';
import { UserService } from '../../services/userService';
import { userValidation } from '../validations/user.validation';

export class UserController {
    private userService = new UserService();

    async create(req: Request, res: Response): Promise<void> {
        try {
            const { error } = userValidation.createUser.body.validate(req.body);
            if (error) {
                const errors = error.details.map(detail => ({
                    path: detail.path,
                    message: detail.message
                }));

                res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors
                });
                return;
            }

            const { email, username } = req.body;
            const user = await this.userService.createUser(email, username);
            res.status(201).json(user);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Unexpected error occurred' });
            }
        }
    }

    async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await this.userService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching users' });
        }
    }

    async getUser(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }

            const user = await this.userService.getUser(id);
            res.json(user);
        } catch (error) {
            if (error instanceof Error) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Unexpected error occurred' });
            }
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }

            const { error } = userValidation.updateUser.body.validate(req.body);
            if (error) {
                const errors = error.details.map(detail => ({
                    path: detail.path,
                    message: detail.message
                }));

                res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors
                });
                return;
            }

            const updatedUser = await this.userService.updateUser(id, req.body);
            res.json(updatedUser);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Unexpected error occurred' });
            }
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }

            await this.userService.deleteUser(id);
            res.status(204).send();
        } catch (error) {
            if (error instanceof Error) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Unexpected error occurred' });
            }
        }
    }
}
