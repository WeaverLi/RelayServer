const Message = require('../../../message');
const {findDevObjFromRedis}=require('../../../storeAPI/devObjAPI');
const writeData=require('../../../util');
// 加载命令文件

const control = (req, res) => {
  const {}=req.body;
  // 查找对应命令文件

  // 封装消息


  // 查找设备对象并发控制请求给设备


};

module.exports = control;