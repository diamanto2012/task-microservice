"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_1 = require("../../services/userService");
const user_validation_1 = require("../validations/user.validation");
class UserController {
    constructor() {
        this.userService = new userService_1.UserService();
    }
    async create(req, res) {
        try {
            const { error } = user_validation_1.userValidation.createUser.body.validate(req.body);
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
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Unexpected error occurred' });
            }
        }
    }
    async getUsers(req, res) {
        try {
            const users = await this.userService.getAllUsers();
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ error: 'Error fetching users' });
        }
    }
    async getUser(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }
            const user = await this.userService.getUser(id);
            res.json(user);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Unexpected error occurred' });
            }
        }
    }
    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }
            const { error } = user_validation_1.userValidation.updateUser.body.validate(req.body);
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
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Unexpected error occurred' });
            }
        }
    }
    async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }
            await this.userService.deleteUser(id);
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Unexpected error occurred' });
            }
        }
    }
}
exports.UserController = UserController;
