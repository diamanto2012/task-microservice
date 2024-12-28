"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_source_1 = require("./config/data.source");
const taskRoutes_1 = __importDefault(require("./api/routes/taskRoutes"));
const userRoutes_1 = __importDefault(require("./api/routes/userRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use('/api', taskRoutes_1.default);
app.use('/api', userRoutes_1.default);
const startServer = async () => {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('Database connected successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};
startServer();
