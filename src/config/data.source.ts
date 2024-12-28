import { DataSource } from 'typeorm';
import { config } from './config';
import { Task } from '../db/models/task';
import { User } from '../db/models/user';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    synchronize: true,
    logging: true,
    entities: [Task, User],
    migrations: ['src/db/migrations/**/*.ts'],
    subscribers: [],
});
