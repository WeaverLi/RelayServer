const Message = require('../../../message');
const {findDevObjFromRedis} = require('../../../storeAPI/devObjAPI');
const writeData = require('../../../util');

const query = (req, res) => {
  const {token, netID, devID, chnlType, chnlNumber, chnlParam} = req.query;

  // 封装消息
  const queryMessage = new Message({type: 'H', token, netID, devID});
  queryMessage.addBody({chnlType, chnlNumber, chnlParam});
  const msgBuffer = queryMessage.encode();

  // 查找设备对象并发查询请求给对应设备
  findDevObjFromRedis(`${netID}-${devID}`).then(result => {
    writeData(result.tcpClient, msgBuffer);
  }).catch(err => {
    console.log(err);
    return err;
  });
};

module.exports = query;