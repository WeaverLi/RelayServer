const {findHttpReq, delHttpReq} = require('../../objectCache/httpCacheAPI');

const messageMHHandle = (tcpClient, msg) => {
  if (msg.type === 'm') {
    const result = findHttpReq(msg.token);  // id为标识HTTP请求的序列号
    if (result === -1) {
      console.log('失败');  // 找不到请求
    } else {
      delHttpReq(msg.token);
      return result.res.json({reason: 'OK'});
    }
  } else if (msg.type === 'h') {
    const result = findHttpReq(msg.token);  // id为标识HTTP请求的序列号
    if (result === -1) {
      console.log('失败');  // 找不到请求
    } else {
      delHttpReq(msg.token);
      return result.res.json({reason: 'OK'});
    }
  } else {
    new Error('不可能出现除m,h外其它type');
  }
};

module.exports = messageMHHandle;