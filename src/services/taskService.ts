import { AppDataSource } from '../config/data.source';
import redisClient from '../config/redis.client';
import { Task } from '../db/models/task';
import { User } from '../db/models/user';
import { deleteKeysByPattern, checkCache } from '../utils/redisUtils';
import { config } from '../config/config';
import { In } from 'typeorm';

const CACHE_TTL = config.redis.ttl;
const CACHE_PREFIX = 'tasks:';

export class TaskService {
    private taskRepository = AppDataSource.getRepository(Task);
    private userRepository = AppDataSource.getRepository(User);

    async createTask(title: string, description: string, userId: number): Promise<Task> {
        // Check cache state before task creation
        console.log('\n=== Cache Check Before Task Creation ===');
        await checkCache();

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
    
        if (!user) {
            throw new Error('User not found');
        }

        const task = this.taskRepository.create({ title, description, user });
        const savedTask = await this.taskRepository.save(task);

        // Clear cache after adding new task
        console.log('\n=== Clearing Cache After Task Creation ===');
        await this.clearCache();

        // Check cache state after clearing
        console.log('\n=== Cache Check After Clearing ===');
        await checkCache();

        return savedTask;
    }

    async getTasks(page: number, limit: number): Promise<any> {
        const cacheKey = `${CACHE_PREFIX}${page}:${limit}`;
        console.log(`\nAttempting to fetch tasks for page ${page} with limit ${limit}`);
        console.log(`Cache key: ${cacheKey}`);

        // Try to get data from cache
        const cachedTasks = await redisClient.get(cacheKey);
        if (cachedTasks) {
            console.log('Cache HIT - Returning cached tasks');
            return JSON.parse(cachedTasks);
        }

        console.log('Cache MISS - Fetching from database');

        // Get total number of tasks with a separate query
        const total = await this.taskRepository.count();
        console.log(`Total tasks in database: ${total}`);

        // Get tasks with pagination
        const tasks = await this.taskRepository.find({
            skip: (page - 1) * limit,
            take: limit,
            relations: ['user'],
        });

        const result = { tasks, total };

        // Save results to cache
        console.log(`Caching results with TTL: ${CACHE_TTL} seconds`);
        await redisClient.set(cacheKey, JSON.stringify(result), {
            EX: CACHE_TTL,
        });

        return result;
    }

    async updateTaskStatus(id: number, status: string): Promise<Task> {
        console.log(`\n=== Updating Task ${id} Status to ${status} ===`);
        
        // Check cache before updating
        console.log('\n=== Cache Check Before Status Update ===');
        await checkCache();

        const task = await this.taskRepository.findOne({ 
            where: { id },
            relations: ['user']
        });

        if (!task) {
            throw new Error(`Task with id ${id} not found`);
        }

        // Check if status is a valid value
        const validStatuses = ['pending', 'in-progress', 'done'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        // Update status
        task.status = status;
        const updatedTask = await this.taskRepository.save(task);

        // Clear cache after updating
        console.log('\n=== Clearing Cache After Status Update ===');
        await this.clearCache();

        // Check cache state after clearing
        console.log('\n=== Cache Check After Clearing ===');
        await checkCache();

        return updatedTask;
    }

    async deleteTasks(ids: number[]): Promise<void> {
        // Check cache state before deleting tasks
        console.log('\n=== Cache Check Before Tasks Deletion ===');
        await checkCache();

        await this.taskRepository.delete({ id: In(ids) });

        // Clear cache after deleting tasks
        console.log('\n=== Clearing Cache After Tasks Deletion ===');
        await this.clearCache();

        // Check cache state after clearing
        console.log('\n=== Cache Check After Clearing ===');
        await checkCache();
    }

    private async clearCache(): Promise<void> {
        const pattern = `${CACHE_PREFIX}*`;
        console.log(`Clearing cache with pattern: ${pattern}`);
        await deleteKeysByPattern(pattern);
    }
}