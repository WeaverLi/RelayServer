const {Device, DeviceCache} = require('../deviceCache');

const devObjs = new DeviceCache();

const addDevObj = ({devID = 0, token = 0, devType = 0, channelInfo = [], devName = 0, serialNo = 0, did = 0, cfgFile = 0, socket = 0, lastSeq = 0}) => {
  const device = new Device({devID, token, devType, channelInfo, devName, serialNo, did, cfgFile, socket, lastSeq});
  return devObjs.add(device);
};

const findDevObj = ({devID = null, devName = null, serialNo = null, did = null}) => {
  return devObjs.find({devID, devName, serialNo, did});
};

const updateDevObj = ({devID = null, devName = null, serialNo = null, did = null}, Obj = null) => {
  return devObjs.update({devID, devName, serialNo, did}, Obj);
};

const delDevObj = ({devID = null, devName = null, serialNo = null, did = null}) => {
  return devObjs.del({devID, devName, serialNo, did});
};

module.exports = {
  addDevObj,
  updateDevObj,
  findDevObj,
  delDevObj
};