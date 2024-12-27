import { AppDataSource } from '../database/connection';
import redisClient from '../database/redisClient';
import { Task } from '../models/task';
import { User } from '../models/user';
import { deleteKeysByPattern, checkCache } from '../utils/redisUtils';

const CACHE_TTL = 60; // 60 секунд
const CACHE_PREFIX = 'tasks:';

export class TaskService {
    private taskRepository = AppDataSource.getRepository(Task);
    private userRepository = AppDataSource.getRepository(User);

    async createTask(title: string, description: string, userId: number): Promise<Task> {
        // Проверяем текущее состояние кэша перед созданием задачи
        console.log('\n=== Cache Check Before Task Creation ===');
        await checkCache();

        let user = await this.userRepository.findOne({
            where: { id: userId },
        });
    
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
        console.log('\n=== Clearing Cache After Task Creation ===');
        await this.clearCache();

        // Проверяем состояние кэша после очистки
        console.log('\n=== Cache Check After Clearing ===');
        await checkCache();

        return savedTask;
    }

    async getTasks(page: number, limit: number): Promise<any> {
        const cacheKey = `${CACHE_PREFIX}${page}:${limit}`;
        console.log(`\nAttempting to fetch tasks for page ${page} with limit ${limit}`);
        console.log(`Cache key: ${cacheKey}`);

        // Попробуем получить данные из кэша
        const cachedTasks = await redisClient.get(cacheKey);
        if (cachedTasks) {
            console.log('Cache HIT - Returning cached tasks');
            return JSON.parse(cachedTasks);
        }

        console.log('Cache MISS - Fetching from database');

        // Получаем общее количество задач отдельным запросом
        const total = await this.taskRepository.count();
        console.log(`Total tasks in database: ${total}`);

        // Получаем задачи с пагинацией
        const tasks = await this.taskRepository.find({
            skip: (page - 1) * limit,
            take: limit,
            relations: ['user'],
        });

        const result = { tasks, total };

        // Сохраняем результаты в кэш
        console.log(`Caching results with TTL: ${CACHE_TTL} seconds`);
        await redisClient.set(cacheKey, JSON.stringify(result), {
            EX: CACHE_TTL,
        });

        return result;
    }

    async updateTaskStatus(id: number, status: string): Promise<Task> {
        console.log(`\n=== Updating Task ${id} Status to ${status} ===`);
        
        // Проверяем кэш перед обновлением
        console.log('\n=== Cache Check Before Status Update ===');
        await checkCache();

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
        console.log('\n=== Clearing Cache After Status Update ===');
        await this.clearCache();

        // Проверяем состояние кэша после очистки
        console.log('\n=== Cache Check After Clearing ===');
        await checkCache();

        return updatedTask;
    }

    async deleteTasks(ids: number[]): Promise<void> {
        console.log(`\n=== Deleting Tasks: ${ids.join(', ')} ===`);
        
        // Проверяем кэш перед удалением
        console.log('\n=== Cache Check Before Deletion ===');
        await checkCache();

        await this.taskRepository.delete(ids);

        // Очистка кэша после удаления задач
        console.log('\n=== Clearing Cache After Deletion ===');
        await this.clearCache();

        // Проверяем состояние кэша после очистки
        console.log('\n=== Cache Check After Clearing ===');
        await checkCache();
    }

    private async clearCache(): Promise<void> {
        const pattern = `${CACHE_PREFIX}*`;
        console.log(`Clearing cache with pattern: ${pattern}`);
        await deleteKeysByPattern(pattern);
    }
}