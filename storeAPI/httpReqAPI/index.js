const HttpReqCache = require('../redisCache/httpReqCache');
const redisClient = require('../redisClient');

const HttpReqs = new HttpReqCache(redisClient);

export const saveHttpReqToRedis = (req, res, next) => {
  HttpReqs.add(req, res);

  next();
};

export const findHttpReqFromRedis = (id) => {
  HttpReqs.find(id);
  HttpReqs.del(id);
};
