"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.taskValidation = {
    createTask: {
        body: joi_1.default.object({
            title: joi_1.default.string()
                .required()
                .min(1)
                .max(100)
                .trim(),
            description: joi_1.default.string()
                .required()
                .min(1)
                .max(500)
                .trim(),
            status: joi_1.default.string()
                .valid('pending', 'in-progress', 'done')
                .default('pending'),
            userId: joi_1.default.number()
                .integer()
                .positive()
        })
    },
    updateTask: {
        params: joi_1.default.object({
            id: joi_1.default.number()
                .required()
                .integer()
                .positive()
        }),
        body: joi_1.default.object({
            title: joi_1.default.string()
                .min(1)
                .max(100)
                .trim(),
            description: joi_1.default.string()
                .min(1)
                .max(500)
                .trim(),
            status: joi_1.default.string()
                .valid('pending', 'in-progress', 'done'),
            userId: joi_1.default.number()
                .integer()
                .positive()
        }).min(1)
    },
    getTaskById: {
        params: joi_1.default.object({
            id: joi_1.default.number()
                .required()
                .integer()
                .positive()
        })
    },
    deleteTask: {
        params: joi_1.default.object({
            id: joi_1.default.number()
                .required()
                .integer()
                .positive()
        })
    },
    deleteTasks: {
        body: joi_1.default.object({
            ids: joi_1.default.array()
                .items(joi_1.default.number()
                .integer()
                .positive()
                .required())
                .min(1)
                .required()
        })
    }
};
