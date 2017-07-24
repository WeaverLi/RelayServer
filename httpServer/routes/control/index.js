const Message = require('../../../message');
const ConfigFile = require('../../../configFile');
const {findDevObjFromRedis} = require('../../../objectCache/devObj');
const writeData = require('../../../util');
// 加载命令文件

const control = (req, res) => {
  const {appkey, did,} = req.body;
  // 查找对应命令文件
  const configFile = new ConfigFile();
  configFile.loadFile();
  // 封装消息
  const message=new Message();
  message.addBody();
  // 查找设备对象并发控制请求给设备
  findDevObjFromRedis(``);

};

module.exports = control;