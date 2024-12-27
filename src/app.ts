import express from 'express';
// import bodyParser from 'body-parser';
// import { initializeDatabase } from './database/connection'; // Импортируйте вашу функцию инициализации
import { AppDataSource } from './database/connection';
import taskRoutes from './routes/taskRoutes';

// Функция для инициализации соединения
const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected successfully.');
    } catch (error) {
        console.error('Database connection error:', error);
        throw error; // Пробрасываем ошибку дальше
    }
};

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/', taskRoutes);

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected successfully.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1); // Завершаем процесс, если не удалось подключиться к БД
    }
};

startServer();
