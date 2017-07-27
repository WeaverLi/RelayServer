const uuidv1 = require('uuid');
const HttpReqCache = require('../redisCache/httpReqCache');
const redisClient = require('../redisClient');

const HttpReqs = new HttpReqCache(redisClient);

const addHttpReqToRedis = (req, res, next) => {
  const uuid = uuidv1();
  HttpReqs.add(uuid,{req, res});
  next();
};

// 返回http请求res
const findHttpReqFromRedis = id => {
  return HttpReqs.find(id);
};

const delHttpReqFromRedis = id => {
  return HttpReqs.del(id);
};

module.exports = {
  addHttpReqToRedis,
  findHttpReqFromRedis,
  delHttpReqFromRedis
};
