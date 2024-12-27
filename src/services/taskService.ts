import { AppDataSource } from '../database/connection'; // Импортируйте ваш источник данных
import redisClient from '../database/redisClient'; // Импортируйте ваш Redis клиент
import { Task } from '../models/task';
import { User } from '../models/user';


export class TaskService {
    private taskRepository = AppDataSource.getRepository(Task);
    private userRepository = AppDataSource.getRepository(User);

    async createTask(title: string, description: string, userId: number): Promise<Task> {
        let user = await this.userRepository.findOne({
            where: { id: userId },
        });
    

        // Если пользователь не найден, создаем нового пользователя
        if (!user) {
            user = this.userRepository.create({
                id: 1, // Устанавливаем id равным 1
                email: 'mail@mail.ru', // Устанавливаем почту
                username: 'user', // Устанавливаем имя пользователя
            });
            await this.userRepository.save(user); // Сохраняем нового пользователя
        }

        const task = this.taskRepository.create({ title, description, user });

        // Очистка кэша после добавления новой задачи
        await redisClient.del('tasks:*'); // Удаляем все ключи с префиксом 'tasks:'

        return await this.taskRepository.save(task);
    }
    async getTasks(page: number, limit: number): Promise<any> {
        const cacheKey = `tasks:${page}:${limit}`;

        console.log(`Fetching tasks for page ${page} with limit ${limit}`);

        await redisClient.del('tasks:*'); // Удаляем все ключи с префиксом 'tasks:'
        // Получение всех ключей (осторожно с производительностью)
        const keys = await redisClient.keys('tasks:*'); // Получаем все ключи с префиксом 'tasks:'
        console.log('All keys in cache:', keys);
        
        
        // Попробуем получить данные из кэша
        const cachedTasks = await redisClient.get(cacheKey);
        if (cachedTasks) {
            console.log('Returning cached tasks');
            return JSON.parse(cachedTasks); // Возвращаем данные из кэша
        }

        const [tasks, total] = await this.taskRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            relations: ['user'], // Предполагается, что у вас есть связь с пользователем
        });

        // Сохраняем результаты в кэш
        await redisClient.set(cacheKey, JSON.stringify({ tasks, total }), {
            EX: 10, // Устанавливаем время жизни кэша (например, 1 час)
        });

        return { tasks, total };
    }

    async updateTaskStatus(id: number, status: string): Promise<Task> {
        const task = await this.taskRepository.findOne({ where: { id } });

        if (!task) {
            throw new Error('Task not found');
        }

        task.status = status; // Обновляем статус
        await this.taskRepository.save(task); // Сохраняем изменения

        // Очистка кэша после обновления задачи
        await redisClient.del('tasks:*'); // Удаляем все ключи с префиксом 'tasks:'

        return task;
    }

    async deleteTasks(ids: number[]): Promise<void> {
        await this.taskRepository.delete(ids); // Удаляем задачи по массиву идентификаторов

        // Очистка кэша после удаления задач
        await redisClient.del('tasks:*'); // Удаляем все ключи с префиксом 'tasks:'
    }
}