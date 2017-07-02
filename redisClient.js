const redis = require("redis");

// 创建redis客户端连接
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

// redis 链接错误
redisClient.on('error', err => console.log(err));

module.exports = redisClient;
