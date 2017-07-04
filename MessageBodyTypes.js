/**
 * 节点注册(登录)、心跳
 */

// 注册(登录)请求消息
export const MSG_R_REGIST_REQ = {
  rType: 1,
  rCnt: 0,
  rLen: 4,

  devType: 0,
  hVer: 0,
  sVer: 0,
  devName: '',
  seriaNo: ''
};

// 心跳请求消息,多个通道的消息
export const MSG_R_HEARTBEAT_REQ = {
  rType: 1,
  rCnt: 0,
  rLen: 4,

  heartBeat: [{type: '', number: '', param: 0}]
};

// 注册(登录)响应消息
export const MSG_r_REGIST_RES = {
  rType: 1,
  rCnt: 0,
  rLen: 4,

  devID: 0,
  token: 0,
  ts: 10
};

// 心跳响应消息
export const MSG_r_HEARTBEAT_RES = {
  token: 0,
  ts: 10
};

/**
 * 控制、查询
 */

// 控制、查询请求消息
export const MSG_MH_COMMAND_REQ = {
  chnlType: '',
  chnlnumber: 0,
  chnlParam: '',

  length: 0,
  mVer: 4,
  mType: 4,
  mParam: '',
  cmds: []
};

// 控制成功应答消息
export const MSG_M_COMMAND_RES = {};

// 查询成功应答消息
export const MSG_H_COMMAND_RES = {
  chnlType: '',
  chnlnumber: 0,
  chnlParam: '',
};