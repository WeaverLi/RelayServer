const Message = require('./message');

module.exports = Message;

/** Message类使用方法
 *  属性：{
 *         type,              // 消息类型
 *         length,            // 消息总长度
 *         token,             //
 *         netID,             // 子网ID
 *         devID,             // 设备ID
 *         bodys              // 消息主体
 *       }
 *
 * 方法：
 *       addBody(magBodyType, msgBody)    // 编码前使用，参数masBodyType是body类型，msgBody设定该类型的某些属性，无返回值
 *       encode()                         // 编码，返回编码后的buffer<Buffer类型>
 *       decode(buffer)                   // 解码，参数buffer要解码的消息Buffer，返回Message
 *
 * */