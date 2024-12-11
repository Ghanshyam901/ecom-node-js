import redis from 'redis';

const redisClient = redis.createClient();

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

await redisClient.connect();  // For Redis client >= v4.x
export default redisClient;
