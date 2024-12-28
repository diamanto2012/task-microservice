"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const config_1 = require("./config");
const redisClient = (0, redis_1.createClient)({
    url: config_1.config.redis.url || 'redis://localhost:6379'
});
redisClient.on('error', (err) => console.error('Redis Client Error', err));
(async () => {
    await redisClient.connect();
})();
exports.default = redisClient;
