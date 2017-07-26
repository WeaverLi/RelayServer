const HttpReqCache = require('../redisCache/httpReqCache');
const redisClient = require('../redisClient');

const HttpReqs = new HttpReqCache(redisClient);

const addHttpReqToRedis = (req, res, next) => {
  // HttpReqs.add({req, res}).then(id => {
  //   next(id);
  // }).catch(err => {
  //   console.log(err);
  //   return err;
  // });
  // HttpReqs.add({req, res});
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
