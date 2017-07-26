const Message = require('../../../message');
const ConfigFile = require('../../../configFile');
const {findDevObjFromRedis} = require('../../../objectCache/devObj');
const writeData = require('../../../util');
// 加载命令文件

const control = (req, res) => {
  const {appkey, did, seq} = req.body;
  // 查找对应命令文件
  if (appkey === '127.0.0.1:5000') {
    // 读命令文件
    const configFile = new ConfigFile({});
    configFile.loadFile('标准开关1527.cfg');
    console.log(configFile.cmds[0]);
    // 封装消息
    const message = new Message({type:'M',token:0,netID:1500978583,devID:875});
    const msgBody = {
      chnlType: 65,
      chnlNumber: 1,
      chnlParam: 5,
      // length: configFile.cmds[0].cmd.length,
      mVer: 1,
      mType: configFile.type >> 5,
      mParam: configFile.cmds[0].cmd.key & 0x00ff,
      cmds:configFile.cmds[0].cmd
    };
    message.addBody(null, msgBody);
    console.log(message);
    // message.encode();
    // // 查找设备对象并发控制请求给设备
    // const res = findDevObjFromRedis('1500978583-875');
    // console.log(res);
  } else {
    new Error('错误！！！');
  }

};

module.exports = control;