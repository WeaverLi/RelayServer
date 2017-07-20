/**
 * 节点注册(登录)、心跳
 */

// 注册(登录)请求消息
function MSG_R_REGIST_REQ({rType = 1, rCnt = 0, rLen = 0, devType = 0, hVer = 0, sVer = 0, devName = '', seriaNo = ''}) {
  this.rType = rType;
  this.rCnt = rCnt;
  this.rLen = rLen;

  this.devType = devType;
  this.hVer = hVer;
  this.sVer = sVer;
  this.devName = devName;
  this.seriaNo = seriaNo;
}

// 心跳请求消息,多个通道的消息
function MSG_R_HEARTBEAT_REQ({
                               rType = 2, rCnt = 0, rLen = 0, heartBeat = new Array(16).fill({
    type: 0, number: 0, param: 0
  })
                             }) {
  this.rType = rType;
  this.rCnt = rCnt;
  this.rLen = rLen;

  this.heartBeat = heartBeat;
}

// 注册(登录)响应消息
function MSG_R_REGIST_RES({rType = 1, rCnt = 0, rLen = 0, devID = 0, token = 0, ts = 10}) {
  this.rType = rType;
  this.rCnt = rCnt;
  this.rLen = rLen;

  this.devID = devID;
  this.token = token;
  this.ts = ts;
}

// 心跳响应消息
function MSG_R_HEARTBEAT_RES({rType = 2, rCnt = 0, rLen = 0, token = 0, ts = 10}) {
  this.rType = rType;
  this.rCnt = rCnt;
  this.rLen = rLen;

  this.token = token;
  this.ts = ts;
}

/**
 * 控制、查询
 */

// 控制请求消息
function MSG_M_COMMAND_REQ({chnlType = '', chnlNumber = 0, chnlParam = '', length = 0, mVer = 0, mType = 0, mParam = '', cmds = 0}) {
  this.chnlType = chnlType;
  this.chnlNumber = chnlNumber;
  this.chnlParam = chnlParam;

  this.length = length;
  this.mVer = mVer;
  this.mType = mType;
  this.mParam = mParam;

  this.cmds = cmds;
}

// 查询请求消息
function MSG_H_COMMAND_REQ({chnlType = '', chnlNumber = 0, chnlParam = ''}) {
  this.chnlType = chnlType;
  this.chnlNumber = chnlNumber;
  this.chnlParam = chnlParam;
}


// 控制成功应答消息
function MSG_M_COMMAND_RES() {
}

// 查询成功应答消息
function MSG_H_COMMAND_RES() {
  this.chnlType = '';
  this.chnlNumber = 0;
  this.chnlParam = '';
}

module.exports = {
  MSG_R_REGIST_REQ,
  MSG_R_HEARTBEAT_REQ,
  MSG_R_REGIST_RES,
  MSG_R_HEARTBEAT_RES,
  MSG_M_COMMAND_REQ,
  MSG_H_COMMAND_REQ,
  MSG_M_COMMAND_RES,
  MSG_H_COMMAND_RES
};