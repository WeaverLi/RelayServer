const Message = require('../../../message');
const ConfigFile = require('../../../configFile');
const {findDevObjFromRedis} = require('../../../objectCache/devObj');
const writeData = require('../../../util');
// 加载命令文件

const control = (req, res) => {
  const {appkey, did,seq} = req.body;
  // 查找对应命令文件
  if (appkey==='127.0.0.1:5000') {
    // 读命令文件
    const configFile = new ConfigFile({});
    configFile.loadFile('标准开关1527.cfg');
    console.log(configFile);
    // 封装消息
    const message = new Message();
    message.addBody('M',{chnlType:});
    // 查找设备对象并发控制请求给设备
    findDevObjFromRedis(``);
  }else {
    new Error('错误！！！');
  }

};

module.exports = control;