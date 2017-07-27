const Message = require('../../../message');
const ConfigFile = require('../../../configFile');
const {addHttpReq} = require('../../../objectCache/httpCacheAPI');
const {findDevObj} = require('../../../objectCache/deviceCacheAPI');
const writeData = require('../../../util');
// 加载命令文件

const control = (req, res) => {
  const result = addHttpReq(req, res);

  if (result === -1) {
    console.log('添加http请求错误！');
  } else {
    const {appkey, did} = req.body;
    // 查找对应命令文件
    if (appkey === '121.40.181.130:5000') {
      // 读命令文件
      const configFile = new ConfigFile({});
      configFile.loadFile('标准开关1527.cfg');
      console.log(configFile.cmds[0]);
      // 查找设备对象并发控制请求给设备
      const dev = findDevObj({did: did});
      // console.log(dev);
      // 封装消息
      const message = new Message({type: 'M', token: result, netID: dev.devID, devID: dev.devID});
      const msgBody = {
        chnlType: 65,
        chnlNumber: 1,
        chnlParam: 5,
        // length: configFile.cmds[0].cmd.length,
        mVer: 1,
        mType: configFile.type >> 5,
        mParam: configFile.cmds[0].cmd.key & 0x00ff,
        cmds: configFile.cmds[0].cmd
      };
      message.addBody(null, msgBody);
      console.log(message);
      const msgBuffer = message.encode();
      // 发送消息
      writeData(dev.socket, msgBuffer);
    } else {
      new Error('错误！！！');
    }
  }
};

module.exports = control;