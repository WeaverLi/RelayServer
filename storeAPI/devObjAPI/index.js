const DeviceObjCache = require('../redisCache/deviceObjCache');
const redisClient = require('../redisClient');

const DevObjs = new DeviceObjCache(redisClient);

export const addDevObjToRedis = (tcpClient, token, netID, devID) => {
  return DevObjs.add({tcpClient, token, netID, devID});
};

export const updateDevObjToRedis = (id, Obj) => {
  return DevObjs.update(id,Obj);
};

export const delDevObjFromRedis = id => {
  return DevObjs.del(id);
};