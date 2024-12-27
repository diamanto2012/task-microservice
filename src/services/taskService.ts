import { AppDataSource } from '../database/connection';
import redisClient from '../database/redisClient';
import { Task } from '../models/task';
import { User } from '../models/user';
import { deleteKeysByPattern, checkCache } from '../utils/redisUtils';

export class TaskService {
    private taskRepository = AppDataSource.getRepository(Task);
    private userRepository = AppDataSource.getRepository(User);

    async createTask(title: string, description: string, userId: number): Promise<Task> {
        // Проверяем текущее состояние кэша перед созданием задачи
        console.log('\nChecking cache before creating new task:');
        await checkCache();

        let user = await this.userRepository.findOne({
            where: { id: userId },
        });
    
        // Если пользователь не найден, создаем нового пользователя
        if (!user) {
            user = this.userRepository.create({
                id: 1,
                email: 'mail@mail.ru',
                username: 'user',
            });
            await this.userRepository.save(user);
        }

        const task = this.taskRepository.create({ title, description, user });
        const savedTask = await this.taskRepository.save(task);

        // Очистка кэша после добавления новой задачи
        console.log('\nClearing cache after creating new task:');
        await deleteKeysByPattern('tasks:*');

        // Проверяем состояние кэша после очистки
        console.log('\nChecking cache after clearing:');
        await checkCache();

        return savedTask;
    }

    async getTasks(page: number, limit: number): Promise<any> {
        const cacheKey = `tasks:${page}:${limit}`;

        console.log(`Fetching tasks for page ${page} with limit ${limit}`);

        
        // Попробуем получить данные из кэша
        const cachedTasks = await redisClient.get(cacheKey);
        if (cachedTasks) {
            console.log('Returning cached tasks');
            return JSON.parse(cachedTasks); // Возвращаем данные из кэша
        }

        // Получаем общее количество задач отдельным запросом
        const total = await this.taskRepository.count();

        // Получаем задачи с пагинацией
        const tasks = await this.taskRepository.find({
            skip: (page - 1) * limit,
            take: limit,
            relations: ['user'],
        });

        const result = { tasks, total };

        // Сохраняем результаты в кэш
        await redisClient.set(cacheKey, JSON.stringify(result), {
            EX: 10,
        });

        return result;
    }

    async updateTaskStatus(id: number, status: string): Promise<Task> {
        const task = await this.taskRepository.findOne({ 
            where: { id },
            relations: ['user']
        });

        if (!task) {
            throw new Error(`Task with id ${id} not found`);
        }

        // Проверяем, что статус является допустимым значением
        const validStatuses = ['pending', 'in-progress', 'done'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        // Обновляем статус
        task.status = status;
        const updatedTask = await this.taskRepository.save(task);

        // Очищаем кэш после обновления
        await deleteKeysByPattern('tasks:*');

        return updatedTask;
    }

    async deleteTasks(ids: number[]): Promise<void> {
        await this.taskRepository.delete(ids);

        // Очистка кэша после удаления задач
        await deleteKeysByPattern('tasks:*');
    }
}