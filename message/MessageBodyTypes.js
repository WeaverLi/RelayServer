/**
 * 节点注册(登录)、心跳
 */

// 注册(登录)请求消息
export const MSG_R_REGIST_REQ = {
  rType: 1,
  rCnt: 0,
  rLen: 0,

  devType: 0,
  hVer: 0,
  sVer: 0,
//  devName: '',
//  seriaNo: ''
};

// 心跳请求消息,多个通道的消息
export const MSG_R_HEARTBEAT_REQ = {
  rType: 2,
  rCnt: 0,
  rLen: 0,

  heartBeat: heartBeat16({type: 0, number: 0, param: 0})
};

// 注册(登录)响应消息
export const MSG_R_REGIST_RES = {
  rType: 1,
  rCnt: 0,
  rLen: 0,

  devID: 0,
  token: 0,
  ts: 10
};

// 心跳响应消息
export const MSG_R_HEARTBEAT_RES = {
  rType: 2,
  rCnt: 0,
  rLen: 0,

  token: 0,
  ts: 10
};

/**
 * 控制、查询
 */

// 控制请求消息
export const MSG_M_COMMAND_REQ = {
  chnlType: '',
  chnlNumber: 0,
  chnlParam: '',

  length: 0,
  mVer: 0,
  mType: 0,
  mParam: '',

  cmds: 0
};

// 查询请求消息
export const MSG_H_COMMAND_REQ = {
  chnlType: '',
  chnlNumber: 0,
  chnlParam: '',
};

// 控制成功应答消息
export const MSG_M_COMMAND_RES = {};

// 查询成功应答消息
export const MSG_H_COMMAND_RES = {
  chnlType: '',
  chnlNumber: 0,
  chnlParam: '',
};


const heartBeat16 = ({type, number, param}) => {
  const heartBearArr = new Array(16);
  for (let item of heartBearArr) {
    item = {type, number, param};
  }

  return heartBearArr;
};