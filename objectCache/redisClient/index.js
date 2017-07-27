const redis = require("redis");

// 创建redis客户端连接
const redisClient = redis.createClient({
  host: '121.40.181.130',
  port: 6333
});

// redis连接成功
redisClient.on('connect', () => console.log('Redis Connect Successfully!'));

// redis 链接错误
redisClient.on('error', err => console.log(err));

module.exports = redisClient;
