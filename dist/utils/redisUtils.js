"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteKeysByPattern = deleteKeysByPattern;
exports.scanKeys = scanKeys;
exports.checkCache = checkCache;
const redis_client_1 = __importDefault(require("../config/redis.client"));
async function deleteKeysByPattern(pattern) {
    // Сначала выведем список ключей, которые будут удалены
    console.log('Searching for keys to delete with pattern:', pattern);
    const keysToDelete = await scanKeys(pattern);
    console.log('Found keys to delete:', keysToDelete);
    // Если найдены ключи, удаляем их
    if (keysToDelete.length > 0) {
        await redis_client_1.default.del(keysToDelete);
        console.log('Successfully deleted keys:', keysToDelete);
    }
    else {
        console.log('No keys found to delete');
    }
}
async function scanKeys(pattern) {
    const keys = [];
    let cursor = 0;
    do {
        const result = await redis_client_1.default.scan(cursor, {
            MATCH: pattern,
            COUNT: 100
        });
        cursor = result.cursor;
        keys.push(...result.keys);
    } while (cursor !== 0);
    return keys;
}
async function checkCache() {
    console.log('\n=== Checking Redis Cache ===');
    const keys = await scanKeys('tasks:*');
    console.log('Current cache keys:', keys);
    // Если есть ключи, выведем их значения
    if (keys.length > 0) {
        console.log('\nCache contents:');
        for (const key of keys) {
            const value = await redis_client_1.default.get(key);
            console.log(`${key}:`, value ? JSON.parse(value) : null);
        }
    }
    console.log('=== End Cache Check ===\n');
}
