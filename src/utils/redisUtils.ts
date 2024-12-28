import redisClient from '../config/redis.client';

export async function deleteKeysByPattern(pattern: string): Promise<void> {
    // Сначала выведем список ключей, которые будут удалены
    console.log('Searching for keys to delete with pattern:', pattern);
    const keysToDelete = await scanKeys(pattern);
    console.log('Found keys to delete:', keysToDelete);

    // Если найдены ключи, удаляем их
    if (keysToDelete.length > 0) {
        await redisClient.del(keysToDelete);
        console.log('Successfully deleted keys:', keysToDelete);
    } else {
        console.log('No keys found to delete');
    }
}

export async function scanKeys(pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = 0;
    
    do {
        const result = await redisClient.scan(cursor, {
            MATCH: pattern,
            COUNT: 100
        });
        
        cursor = result.cursor;
        keys.push(...result.keys);
    } while (cursor !== 0);

    return keys;
}

export async function checkCache(): Promise<void> {
    console.log('\n=== Checking Redis Cache ===');
    const keys = await scanKeys('tasks:*');
    console.log('Current cache keys:', keys);
    
    // Если есть ключи, выведем их значения
    if (keys.length > 0) {
        console.log('\nCache contents:');
        for (const key of keys) {
            const value = await redisClient.get(key);
            console.log(`${key}:`, value ? JSON.parse(value) : null);
        }
    }
    console.log('=== End Cache Check ===\n');
}
