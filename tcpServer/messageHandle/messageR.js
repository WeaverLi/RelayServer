const rp = require('request-promise');
const {addDevObj, updateDevObj} = require('../../objectCache/deviceCacheAPI');
const sendDataToDevice = require('../../util');
const Message = require('../../message');


const messageRHandle = (socket, msg) => {
  // const sendmsg = new Message({type: msg.type, token: msg.token, netID: msg.netID, devID: msg.devID});
  if (msg.bodys.length !== 0) {
    for (const body of msg.bodys) {
      if (body.rType === 1 && msg.netID === 0 && msg.devID === 0) { //注册
        const optionSignup = {
          method: 'GET',
          uri: 'http://121.40.181.130:4000/api/dev/verify',
          body: {
            sn: body.seriaNo,
            type: body.devType,
            // appid:
          },
          json: true // Automatically stringifies the body to JSON
        };
        rp(optionSignup).then(res => {
          if (res.reason === 'OK') {    //可以注册
            // 分配token,devID
            const _devID = Math.round((new Date().getTime() % 1000));
            const _token = 0;

            // 创建设备对象
            addDevObj({
              devID: _devID,
              token: 0,    //
              devType: body.devType,
              channelInfo: [],
              devName: body.devName,
              serialNo: body.serialNo,
              did: res.did,
              cfgFile: 0,  //
              socket: socket,
              lastSeq: 0  //
            });
            // 封装登录响应并发送
            const sendmsg = new Message({type: 'r', token: msg.token, netID: msg.netID, devID: msg.devID});
            sendmsg.addBody(1, {devID: _devID, token: _token, ts: Math.round((new Date().getTime()) / 1000)});
            console.log(sendmsg);
            const msgBuffer = sendmsg.encode();
            sendDataToDevice(socket, msgBuffer);
          } else {                      // 不可以注册
            // 发送注册失败消息给设备
          }
        }).catch(err => {
          new Error('发送验证消息失败！');
          console.log(err);
        })
      } else if (body.rType === 2) {                                // 心跳
        // 更新设备对象
        updateDevObj({devID: msg.devID}, {channelInfo: body.heartBeat});

        const optionHeartBeat = {
          method: 'GET',
          uri: 'http://121.40.181.130:4000/api/dev/update',
          body: {
            // id: ,
            state: '',
            details: body.heartBeat
          },
          json: true // Automatically stringifies the body to JSON
        };
        rp(optionHeartBeat).then(res => {
          if (res.reason === 'OK') {
            // sendmsg.addBody('r', {token: msg.token, ts: msg.ts});
            const sendmsg = new Message({type: 'r', token: msg.token, netID: msg.netID, devID: msg.devID});
            sendmsg.addBody(2, {token: msg.token, ts: Math.round((new Date().getTime()) / 1000)});
            const msgBuffer = sendmsg.encode();
            sendDataToDevice(socket, msgBuffer);
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

  // const msgBuffer = sendmsg.encode();
  // console.log(msgBuffer);
  // sendDataToDevice(tcpClient, msgBuffer);

};

module.exports = messageRHandle;