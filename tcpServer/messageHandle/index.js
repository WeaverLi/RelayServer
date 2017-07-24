const Message = require('../../message');
const messageRHandle = require('./messageR');
const messageMHHandle = require('./messageMH');

const messageHandle = (tcpClient, messageBuffer) => {
  const msg = new Message({});
  const newMsg = msg.decode(messageBuffer);
  console.log(newMsg);

  switch (newMsg.type) {
    case 'R':
      messageRHandle(tcpClient, newMsg);
      break;
    case 'm' || 'h':
      messageMHHandle(tcpClient, newMsg);
      break;
    default:
      new Error('从设备传过来的消息不可能是其它的类型吧！');
      break;
  }
};

module.exports = messageHandle;