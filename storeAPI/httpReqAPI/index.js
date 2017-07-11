const HttpReqCache = require('../redisCache/httpReqCache');
const redisClient = require('../redisClient');

const HttpReqs = new HttpReqCache(redisClient);

export const addHttpReqToRedis = (req, res, next) => {
  HttpReqs.add(req, res).then(id=>{
    next(id);
  }).catch(err=>{
    console.log(err);
    return err;
  });
};

// 返回http请求res
export const findHttpReqFromRedis = id => {
  return HttpReqs.find(id);
};

export const delHttpReqFromRedis = id => {
  return HttpReqs.del(id);
};
