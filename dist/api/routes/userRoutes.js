"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
const userController = new userController_1.UserController();
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
exports.default = router;
