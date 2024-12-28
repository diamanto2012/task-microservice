import { createClient } from 'redis';
import { config } from './config';

const redisClient = createClient({
    url: config.redis.url || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
    await redisClient.connect();
})();

export default redisClient;
