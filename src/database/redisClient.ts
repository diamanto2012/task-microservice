import { createClient } from 'redis';

const redisClient = createClient({
    url: 'redis://localhost:6379' // Убедитесь, что адрес соответствует вашему Redis серверу
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
    await redisClient.connect();
})();

export default redisClient;