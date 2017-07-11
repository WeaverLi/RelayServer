const rp = require('request-promise');
const {addDevObjToRedis, updateDevObjToRedis} = require('../../storeAPI/devObjAPI');
const writeData = require('../util');
const Message = require('../../message');


const messageRHandle = (tcpClient, msg) => {
  const sendmsg = new Message({type: msg.type, token: msg.token, netID: msg.netID, devID: msg.devID});

  if (msg.bodys.length !== 0) {
    for (const body of msg.bodys) {
      if (body.rType === 1 && netID === 0 && devID === 0) { //注册
        const optionSignup = {
          method: 'POST',
          uri: 'http://localhost:3000/api/dev/verify',
          body: {
            sn: body.seriaNo,
            type: body.devType,
            // appid:
          },
          json: true // Automatically stringifies the body to JSON
        };
        rp(optionSignup).then(res => {
          if (res.reason === 'OK') {    //可以注册
            addDevObjToRedis(tcpClient, msg.token, msg.netID, msg.devID);     // 创建设备对象

            sendmsg.addBody('r', {devID: msg.devID, token: msg.token, ts: msg.ts})   // 添加注册响应body
          } else {                      // 不可以注册
            // 发送失败消息
          }
        }).catch(err => {
          new Error('发送验证消息失败！');
          console.log(err);
        })
      } else if (body.rType === 1 && netID !== 0 && devID !== 0) {  // 登录
        const optionSignin = {
          method: 'POST',
          uri: 'http://localhost:3000/api/dev/verify',
          body: {
            sn: body.seriaNo,
            type: body.devType,
            // appid:
          },
          json: true // Automatically stringifies the body to JSON
        };
        rp(optionSignin).then(res => {
          if (res.reason === 'OK') {    //可以登录
            addDevObjToRedis(tcpClient, msg.token, msg.netID, msg.devID);

            sendmsg.addBody('r', {devID: msg.devID, token: msg.token, ts: msg.ts})   // 添加登录响应body
          } else {                      // 不可以登录
            // 发送失败消息
          }
        }).catch(err => {
          new Error('发送验证消息失败！');
          console.log(err);
        })
      } else if (body.rType === 2) {                                // 心跳
        updateDevObjToRedis(`${msg.netID}-${msg.devID}`, body.heartBeat);   // 更新设备对象

        const optionHeartBeat = {
          method: 'POST',
          uri: 'http://localhost:3000/api/dev/update',
          body: {
            // id: ,
            ts: body.ts,
            state: '',
            details: body.heartBeat
          },
          json: true // Automatically stringifies the body to JSON
        };
        rp(optionHeartBeat).then(res => {
          if (res.reason === 'OK') {
            sendmsg.addBody('r', {token: msg.token, ts: msg.ts});
          } else {
            // 发送失败消息
          }
        })
      } else {
        new Error('不是登录、注册、心跳消息！');
      }
    }
  } else {
    new Error('注册、登录、心跳请求消息主体不可能为空！')
  }

  const msgBuffer = sendmsg.encode();
  writeData(tcpClient, msgBuffer);

};

module.exports = messageRHandle;