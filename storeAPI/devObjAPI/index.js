const DeviceObjCache=require('../redisCache/deviceObjCache');
const redisClient=require('../redisClient');

const DevObjs=new DeviceObjCache(redisClient);
