"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.userValidation = {
    createUser: {
        body: joi_1.default.object({
            username: joi_1.default.string()
                .required()
                .min(3)
                .max(30)
                .trim(),
            email: joi_1.default.string()
                .required()
                .email()
                .trim()
                .lowercase()
        })
    },
    updateUser: {
        params: joi_1.default.object({
            id: joi_1.default.number()
                .required()
                .integer()
                .positive()
        }),
        body: joi_1.default.object({
            username: joi_1.default.string()
                .min(3)
                .max(30)
                .trim(),
            email: joi_1.default.string()
                .email()
                .trim()
                .lowercase()
        }).min(1)
    },
    getUserById: {
        params: joi_1.default.object({
            id: joi_1.default.number()
                .required()
                .integer()
                .positive()
        })
    }
};
