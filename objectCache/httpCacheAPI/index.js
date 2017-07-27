const uuidv1 = require('uuid');
const HttpCache = require('../httpCache');

const httpObjs = new HttpCache();

const addHttpReq = (req, res) => {
  const seq = uuidv1();
  return httpObjs.add(seq, {req, res});
  // next();
};

// 返回http请求res
const findHttpReq = seq => {
  return httpObjs.find(seq);
};

const delHttpReq = seq => {
  return httpObjs.del(seq);
};

module.exports = {
  addHttpReq,
  findHttpReq,
  delHttpReq
};
