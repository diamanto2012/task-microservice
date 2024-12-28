import { AppDataSource } from '../config/data.source';
import { User } from '../db/models/user';
import redisClient from '../config/redis.client';
import { config } from '../config/config';
import { deleteKeysByPattern, checkCache } from '../utils/redisUtils';
import { Not } from 'typeorm';

const CACHE_TTL = config.redis.ttl;
const CACHE_PREFIX = 'users:';

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async createUser(email: string, username: string): Promise<User> {
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

    async getUser(id: number): Promise<User> {
        const cacheKey = `${CACHE_PREFIX}${id}`;
        const cachedUser = await redisClient.get(cacheKey);

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

        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(user));
        return user;
    }

    async getAllUsers(): Promise<User[]> {
        const cacheKey = `${CACHE_PREFIX}all`;
        const cachedUsers = await redisClient.get(cacheKey);

        if (cachedUsers) {
            return JSON.parse(cachedUsers);
        }

        const users = await this.userRepository.find({
            relations: ['tasks']
        });

        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(users));
        return users;
    }

    async updateUser(id: number, data: Partial<User>): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id }
        });

        if (!user) {
            throw new Error('User not found');
        }

        if (data.email || data.username) {
            const existingUser = await this.userRepository.findOne({
                where: [
                    { email: data.email, id: Not(id) },
                    { username: data.username, id: Not(id) }
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

    async deleteUser(id: number): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id }
        });

        if (!user) {
            throw new Error('User not found');
        }

        await this.userRepository.remove(user);
        await this.clearCache();
    }

    private async clearCache(): Promise<void> {
        await deleteKeysByPattern(`${CACHE_PREFIX}*`);
        console.log('User cache cleared');
    }
}
