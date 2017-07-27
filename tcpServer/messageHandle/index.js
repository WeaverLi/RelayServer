const Message = require('../../message');
const messageRHandle = require('./messageR');
const messageMHHandle = require('./messageMH');

const messageHandle = (socket, messageBuffer) => {
  const msg = new Message({});
  const newMsg = msg.decode(messageBuffer);
  console.log(newMsg);

  if (newMsg < 0) {
    console.log('消息格式错误！');
  } else {
    switch (newMsg.type) {
      case 'R':
        messageRHandle(socket, newMsg);
        break;
      case 'm' || 'h':
        messageMHHandle(socket, newMsg);
        break;
      default:
        new Error('从设备传过来的消息不可能是其它的类型吧！');
        break;
    }
  }
};

module.exports = messageHandle;