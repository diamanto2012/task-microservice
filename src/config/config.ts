export const config = {
    port: process.env.PORT || 3000,
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '123456',
        database: process.env.DB_NAME || 'task_manager'
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        ttl: 60 // 60 seconds
    }
};
