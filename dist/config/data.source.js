"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const config_1 = require("./config");
const task_1 = require("../db/models/task");
const user_1 = require("../db/models/user");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: config_1.config.database.host,
    port: config_1.config.database.port,
    username: config_1.config.database.username,
    password: config_1.config.database.password,
    database: config_1.config.database.database,
    synchronize: true,
    logging: true,
    entities: [task_1.Task, user_1.User],
    migrations: ['src/db/migrations/**/*.ts'],
    subscribers: [],
});
