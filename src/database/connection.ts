import { DataSource } from 'typeorm';
import { User } from '../models/user'; // Импортируйте ваши модели
import { Task } from '../models/task'; // Импортируйте ваши модели

export const AppDataSource = new DataSource({
    type: 'postgres', // Указываем тип базы данных
    host: 'localhost', // Хост базы данных
    port: 5432, // Порт PostgreSQL
    username: 'postgres', // Ваше имя пользователя
    password: '123456', // Ваш пароль
    database: 'task_manager', // Имя вашей базы данных
    entities: [User, Task], // Укажите ваши сущности
    synchronize: true, // Автоматически синхронизировать структуру базы данных с моделями
});