const Redis = require("ioredis");
require('dotenv').config();

exports.redisClient = new Redis(process.env.REDIS_URL,{
    maxRetriesPerRequest:50
});