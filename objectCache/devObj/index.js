const DeviceObjCache = require('../redisCache/deviceObjCache');
const redisClient = require('../redisClient');

const DevObjs = new DeviceObjCache(redisClient);

const addDevObjToRedis = (tcpClient, {token, netID, devID}) => {
  return DevObjs.add({tcpClient, token, netID, devID});
};

const updateDevObjToRedis = (id, Obj) => {
  return DevObjs.update(id, Obj);
};

const findDevObjFromRedis = id => {
  return DevObjs.find(id);
};

const delDevObjFromRedis = id => {
  return DevObjs.del(id);
};

module.exports = {
  addDevObjToRedis,
  updateDevObjToRedis,
  findDevObjFromRedis,
  delDevObjFromRedis
};