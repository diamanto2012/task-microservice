"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const data_source_1 = require("../config/data.source");
const user_1 = require("../db/models/user");
const redis_client_1 = __importDefault(require("../config/redis.client"));
const config_1 = require("../config/config");
const redisUtils_1 = require("../utils/redisUtils");
const typeorm_1 = require("typeorm");
const CACHE_TTL = config_1.config.redis.ttl;
const CACHE_PREFIX = 'users:';
class UserService {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(user_1.User);
    }
    async createUser(email, username) {
        const existingUser = await this.userRepository.findOne({
            where: [{ email }, { username }]
        });
        if (existingUser) {
            throw new Error('User with this email or username already exists');
        }
        const user = this.userRepository.create({ email, username });
        const savedUser = await this.userRepository.save(user);
        await this.clearCache();
        return savedUser;
    }
    async getUser(id) {
        const cacheKey = `${CACHE_PREFIX}${id}`;
        const cachedUser = await redis_client_1.default.get(cacheKey);
        if (cachedUser) {
            return JSON.parse(cachedUser);
        }
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['tasks']
        });
        if (!user) {
            throw new Error('User not found');
        }
        await redis_client_1.default.setEx(cacheKey, CACHE_TTL, JSON.stringify(user));
        return user;
    }
    async getAllUsers() {
        const cacheKey = `${CACHE_PREFIX}all`;
        const cachedUsers = await redis_client_1.default.get(cacheKey);
        if (cachedUsers) {
            return JSON.parse(cachedUsers);
        }
        const users = await this.userRepository.find({
            relations: ['tasks']
        });
        await redis_client_1.default.setEx(cacheKey, CACHE_TTL, JSON.stringify(users));
        return users;
    }
    async updateUser(id, data) {
        const user = await this.userRepository.findOne({
            where: { id }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (data.email || data.username) {
            const existingUser = await this.userRepository.findOne({
                where: [
                    { email: data.email, id: (0, typeorm_1.Not)(id) },
                    { username: data.username, id: (0, typeorm_1.Not)(id) }
                ]
            });
            if (existingUser) {
                throw new Error('Email or username already taken');
            }
        }
        Object.assign(user, data);
        const updatedUser = await this.userRepository.save(user);
        await this.clearCache();
        return updatedUser;
    }
    async deleteUser(id) {
        const user = await this.userRepository.findOne({
            where: { id }
        });
        if (!user) {
            throw new Error('User not found');
        }
        await this.userRepository.remove(user);
        await this.clearCache();
    }
    async clearCache() {
        await (0, redisUtils_1.deleteKeysByPattern)(`${CACHE_PREFIX}*`);
        console.log('User cache cleared');
    }
}
exports.UserService = UserService;
