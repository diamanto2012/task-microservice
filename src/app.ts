import express from 'express';
import { AppDataSource } from './config/data.source';
import taskRoutes from './api/routes/taskRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', taskRoutes);

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected successfully.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();
