"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const data_source_1 = require("../config/data.source");
const redis_client_1 = __importDefault(require("../config/redis.client"));
const task_1 = require("../db/models/task");
const user_1 = require("../db/models/user");
const redisUtils_1 = require("../utils/redisUtils");
const config_1 = require("../config/config");
const typeorm_1 = require("typeorm");
const CACHE_TTL = config_1.config.redis.ttl;
const CACHE_PREFIX = 'tasks:';
class TaskService {
    constructor() {
        this.taskRepository = data_source_1.AppDataSource.getRepository(task_1.Task);
        this.userRepository = data_source_1.AppDataSource.getRepository(user_1.User);
    }
    async createTask(title, description, userId) {
        // Check cache state before task creation
        console.log('\n=== Cache Check Before Task Creation ===');
        await (0, redisUtils_1.checkCache)();
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
        await (0, redisUtils_1.checkCache)();
        return savedTask;
    }
    async getTasks(page, limit) {
        const cacheKey = `${CACHE_PREFIX}${page}:${limit}`;
        console.log(`\nAttempting to fetch tasks for page ${page} with limit ${limit}`);
        console.log(`Cache key: ${cacheKey}`);
        // Try to get data from cache
        const cachedTasks = await redis_client_1.default.get(cacheKey);
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
        await redis_client_1.default.set(cacheKey, JSON.stringify(result), {
            EX: CACHE_TTL,
        });
        return result;
    }
    async updateTaskStatus(id, status) {
        console.log(`\n=== Updating Task ${id} Status to ${status} ===`);
        // Check cache before updating
        console.log('\n=== Cache Check Before Status Update ===');
        await (0, redisUtils_1.checkCache)();
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
        await (0, redisUtils_1.checkCache)();
        return updatedTask;
    }
    async deleteTasks(ids) {
        // Check cache state before deleting tasks
        console.log('\n=== Cache Check Before Tasks Deletion ===');
        await (0, redisUtils_1.checkCache)();
        await this.taskRepository.delete({ id: (0, typeorm_1.In)(ids) });
        // Clear cache after deleting tasks
        console.log('\n=== Clearing Cache After Tasks Deletion ===');
        await this.clearCache();
        // Check cache state after clearing
        console.log('\n=== Cache Check After Clearing ===');
        await (0, redisUtils_1.checkCache)();
    }
    async clearCache() {
        const pattern = `${CACHE_PREFIX}*`;
        console.log(`Clearing cache with pattern: ${pattern}`);
        await (0, redisUtils_1.deleteKeysByPattern)(pattern);
    }
}
exports.TaskService = TaskService;
