const {findHttpReqFromRedis,delHttpReqFromRedis} = require('../../storeAPI/httpReqAPI');

const messageMHHandle = (tcpClient, msg) => {
  if (msg.type === 'm') {
    findHttpReqFromRedis(id).then(res => {
      delHttpReqFromRedis(id);
      res.json({});     //  控制成功响应
    }).catch(err => {
      res.json({});     //  控制失败响应
    });   // id为标识HTTP请求的序列号，待定
  } else if (msg.type === 'h') {
    findHttpReqFromRedis(id).then(res => {
      delHttpReqFromRedis(id);
      res.json({});     //  查询成功响应
    }).catch(err => {
      res.json({});     //  查询失败响应
    });   // id为标识HTTP请求的序列号，待定
  } else {
    new Error('不可能出现除m,h外其它type');
  }
};

module.exports = messageMHHandle;