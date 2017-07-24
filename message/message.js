const {
  MSG_R_REGIST_REQ,
  MSG_R_HEARTBEAT_REQ,
  MSG_R_REGIST_RES,
  MSG_R_HEARTBEAT_RES,
  MSG_M_COMMAND_REQ,
  MSG_H_COMMAND_REQ,
  MSG_M_COMMAND_RES,
  MSG_H_COMMAND_RES
} = require('./MessageBodyTypes');

// 私有方法名定义为Symbol类型
const encodeHead = Symbol('encodeHead');                    // 私有方法名，编码消息头部（20字节）
const encodeBody = Symbol('encodeBody');                    // 私有方法名，编码消息主体部分
const decodeBody = Symbol('decodeBody');                    // 私有方法名，解码消息主体部分
const decodeStr = Symbol('decodeStr');                      // 私有方法名，解码字符串('R'中设备型号，序列号)
const decodeHeartBeatArr = Symbol('decodeHeartBeatArr');    // 私有方法名，解码设备心跳请求（16通道）

const byteOffset = 16;

class Message {
  constructor({type = '', token = 0, netID = 0, devID = 0}) {  // 编码时需给定type,token,netID,devID,解码时都不需要给定
    this.type = type;
    this.length = 20;
    this.token = token;
    this.netID = netID;
    this.devID = devID;
    this.bodys = [];
  }

  addBody(msgBodyType, msgBody) {
    switch (this.type) {
      case 'R':                  // 应该用不到
        switch (msgBodyType) {
          case 1:
            this.bodys.push(new MSG_R_REGIST_REQ(msgBody));
            // 更新消息头
            this.length += 4 + 72;
            // 更新数据部分头
            for (let i = 0; i < this.bodys.length; i++) {
              this.bodys[i].rCnt = this.bodys.length - i - 1;
            }
            this.bodys[this.bodys.length - 1].rLen = 72;

            break;
          case 2:
            this.bodys.push(new MSG_R_HEARTBEAT_REQ(msgBody));
            // 更新消息头
            this.length += 4 + 64;
            // 更新数据部分头
            for (let i = 0; i < this.bodys.length; i++) {
              this.bodys[i].rCnt = this.bodys.length - i - 1;
            }
            this.bodys[this.bodys.length - 1].rLen = 64;

            break;
          default:
            break;
        }
        break;

      case 'r':
        switch (msgBodyType) {
          case 1:
            this.bodys.push(new MSG_R_REGIST_RES(msgBody));
            // 更新消息头
            this.length += 4 + 12;
            // 更新数据头部
            for (let i = 0; i < this.bodys.length; i++) {
              this.bodys[i].rCnt = this.bodys.length - i - 1;
            }
            this.bodys[this.bodys.length - 1].rLen = 12;

            break;
          case 2:
            this.bodys.push(new MSG_R_HEARTBEAT_RES(msgBody));
            // 更新消息头
            this.length += 4 + 8;
            // 更新数据头部
            for (let i = 0; i < this.bodys.length; i++) {
              this.bodys[i].rCnt = this.bodys.length - i - 1;
            }
            this.bodys[this.bodys.length - 1].rLen = 8;

            break;
          default:
            break;
        }
        break;

      case 'M':
        this.bodys.push(new MSG_M_COMMAND_REQ(msgBody));
        // 更新消息头
        this.length += 4 + 4 + this.bodys[this.bodys.length - 1].cmds.byteLength;
        // 更新数据长度信息
        this.bodys[this.bodys.length - 1].length = this.bodys[this.bodys.length - 1].cmds.byteLength;

        break;

      case 'H':
        this.bodys.push(new MSG_H_COMMAND_REQ(msgBody));
        // 更新消息头
        this.length += 4;

        break;

      case 'm':                            // 应该用不到
        break;

      case 'h':                            // 应该用不到
        this.bodys.push(new MSG_H_COMMAND_RES(msgBody));
        // 更新消息头
        this.length += 4;

        break;

      default:
        break;
    }
  }

  // 编码
  encode() {
    const buffer = Buffer.alloc(this.length);
    const bufferHead = buffer;
    const bufferBodyArr = [];
    let newOffset = byteOffset;

    if (this.bodys.length >= 1 && this.type === 'r') {
      for (let i = 0; i < this.bodys.length; i++) {
        for (let j = 0; j < i; j++) {
          newOffset += 4 + this.bodys[j].rLen;
        }
        bufferBodyArr.push(buffer.slice(newOffset, newOffset + this.bodys[i].rLen + 4));
      }
    } else if (this.bodys.length = 1 && (this.type === 'M' || this.type === 'H')) {
      bufferBodyArr.push(buffer.slice(newOffset, this.bodys.length - 4));
    } else if (this.type === 'f') {

    } else {
      new Error('给出的要编码的消息不正确！');
    }

    this[encodeHead](bufferHead);
    this[encodeBody](bufferBodyArr);

    return buffer;
  }

  // 解码
  decode(buffer) {
    const bufferHead = buffer.slice(0, byteOffset);
    const bufferBody = buffer.slice(byteOffset, buffer.byteLength - 4);

    this.type = String.fromCharCode(bufferHead.readUInt8(1));
    this.length = bufferHead.readUInt16LE(2);

    this.token = bufferHead.readUInt16LE(4);
    this.netID = bufferHead.readUInt32LE(8);
    this.devID = bufferHead.readUInt32LE(12);

    this.bodys = this[decodeBody](bufferBody);

    return this;
  }


  // 私有方法，编码头部
  [encodeHead](bufferHead) {
    bufferHead.writeUInt8(0x7e, 0);
    bufferHead.writeUInt8(this.type.charCodeAt(0), 1);
    bufferHead.writeUInt16LE(this.length, 2);

    bufferHead.writeUInt32LE(this.token, 4);
    bufferHead.writeUInt32LE(this.netID, 8);
    bufferHead.writeUInt32LE(this.devID, 12);

    bufferHead.writeUInt16LE(0x0002, this.length - 4);
    bufferHead.writeUInt16LE(0, this.length - 2);
  }

  // 私有方法，编码bodys
  [encodeBody](bufferBodyArr) {
    for (let i = 0; i < this.bodys.length; i++) {
      switch (this.type) {
        case 'R':    // 不应存在编码
          break;

        case 'r':
          switch (this.bodys[i].rType) {
            case 1:
              bufferBodyArr[i].writeUInt8(0x01, 0);
              bufferBodyArr[i].writeUInt8(this.bodys[i].rCnt, 1);
              bufferBodyArr[i].writeUInt16LE(this.bodys[i].rLen, 2);

              bufferBodyArr[i].writeUInt32LE(this.bodys[i].devID, 4);
              bufferBodyArr[i].writeUInt32LE(this.bodys[i].token, 8);
              bufferBodyArr[i].writeUInt32LE(this.bodys[i].ts, 12);
              break;
            case 2:
              bufferBodyArr[i].writeUInt8(0x02, 0);
              bufferBodyArr[i].writeUInt8(this.bodys[i].rCnt, 1);
              bufferBodyArr[i].writeUInt16LE(this.bodys[i].rLen, 2);

              bufferBodyArr[i].writeUInt32LE(this.bodys[i].token, 4);
              bufferBodyArr[i].writeUInt32LE(this.bodys[i].ts, 8);
              break;
            default:
              break;
          }
          break;

        case 'M':
          bufferBodyArr[i].writeUInt8(this.bodys[i].chnlType, 0);
          bufferBodyArr[i].writeUInt8(this.bodys[i].chnlNumber, 1);
          bufferBodyArr[i].writeUInt16LE(this.bodys[i].chnlParam, 2);

          bufferBodyArr[i].writeUInt16LE(this.bodys[i].length, 4);
          bufferBodyArr[i].writeUInt8(this.bodys[i].mVer * 16 * 16 + this.bodys[i].mType, 6);
          bufferBodyArr[i].writeUInt8(this.bodys[i].mParam, 7);

          // for (let j = 0; j < this.bodys[i].cmds.byteLength; j++) {
          //   bufferBodyArr[i].writeUInt8(j, this.bodys[i].cmds[j]);
          // }
          bufferBodyArr[i].writeUIntLE(this.bodys.cmds, 8, this.bodys.cmds.byteLength);
          break;

        case 'H':
          bufferBodyArr[i].writeUInt8(this.bodys[i].chnlType, 0);
          bufferBodyArr[i].writeUInt8(this.bodys[i].chnlNumber, 1);
          bufferBodyArr[i].writeUInt16LE(this.bodys[i].chnlParam, 2);
          break;

        case 'm':  // 不应存在编码
          break;

        case 'h':  // 不应存在编码
          break;
        case 'f':
          break;
        default:
          break;
      }
    }
  }

  // 私有方法，解码bodys内容
  [decodeBody](bufferBody) {
    const bodys = [];
    const pointer = [];

    if (bufferBody.byteLength !== 0) {
      let bodyLen = 1;
      if (this.type === 'R') {
        bodyLen = bufferBody.readUInt8(1) + 1;
        for (let i = 0; i < bodyLen; i++) {
          if (i === 0) {
            pointer[0] = 0;
          }
          else {
            pointer[i] = pointer[i - 1] + bufferBody.readUInt16LE(pointer[i - 1] + 2) + 4;
          }
        }
      }

      for (let i = 0; i < bodyLen; i++) {
        switch (this.type) {
          case 'R':
            switch (bufferBody.readUInt8(pointer[i])) {
              case 0x01:
                if (this.netID === 0 && this.devID === 0) { // 注册
                  bodys[i] = {
                    rType: bufferBody.readUInt8(pointer[i]),
                    rCnt: bufferBody.readUInt8(pointer[i] + 1),
                    rLen: bufferBody.readUInt16LE(pointer[i] + 2),

                    devType: bufferBody.readUInt32LE(pointer[i] + 4),
                    hVer: bufferBody.readUInt16LE(pointer[i] + 8),
                    sVer: bufferBody.readUInt16LE(pointer[i] + 10),
                    devName: this[decodeStr](bufferBody, pointer[i] + 12, 32),
                    seriaNo: this[decodeStr](bufferBody, pointer[i] + 44, 32)
                  }
                } else {                                    // 登录
                  bodys[i] = {
                    rType: bufferBody.readUInt8(pointer[i]),
                    rCnt: bufferBody.readUInt8(pointer[i] + 1),
                    rLen: bufferBody.readUInt16LE(pointer[i] + 2),

                    devType: bufferBody.readUInt32LE(pointer[i] + 4),
                    hVer: bufferBody.readUInt16LE(pointer[i] + 8),
                    sVer: bufferBody.readUInt16LE(pointer[i] + 10),
                    devName: this[decodeStr](bufferBody, pointer[i] + 12, 32),
                    seriaNo: this[decodeStr](bufferBody, pointer[i] + 44, 32)
                  }
                }
                break;

              case 0x02:
                bodys[i] = {
                  rType: bufferBody.readUInt8(pointer[i]),
                  rCnt: bufferBody.readUInt8(pointer[i] + 1),
                  rLen: bufferBody.readUInt16LE(pointer[i] + 2),

                  heartBeat: this[decodeHeartBeatArr](bufferBody, pointer[i] + 4, 64)

                };
                break;
            }

            break;
          case 'r':           // 不需要解码
            break;
          case 'M':           // 不需要解码
            break;
          case 'H':           // 不需要解码
            break;
          case 'm':      // 'm'没有bodys
            // bodys[]为空
            break;
          case 'h':
            bodys[i] = {
              chnlType: bufferBody.readUInt8(0),
              chnlNumber: bufferBody.readUInt8(1),
              chnlParam: bufferBody.readUInt16LE(2)
            };
            break;
          default:
            break;
        }
      }
    } else if (bufferBody.byteLength === 0 && (this.type === 'm' || this.type === 'h')) {

    } else {
      new Error('解码的消息有误！！！');
    }

    return bodys;
  }

  // 私有方法，解码字符串码
  [decodeStr](buffer, offset, byteLen) {
    let strLen = 0;
    while (buffer.readUInt8(offset + strLen) !== 0) strLen++;

    if (strLen <= byteLen) {
      const strbuf = new Uint8Array(buffer, offset, strLen);
      return buffer.toString('ascii', offset, byteLen);
    }
    else {
      console.log(new Error('string outside the bounds of the buffer!'));
    }
  }

  // 私有方法，解码心跳响应数组内容
  [decodeHeartBeatArr](buffer, offset, byteLen) {
    const heartBeatArr = [];

    for (let i = 0; i < 16; i++) {
      const type = buffer.readUInt8(offset + i * 4);
      const number = buffer.readUInt8(offset + i * 4 + 1);
      const param = buffer.readUInt16LE(offset + i * 4 + 2);
      heartBeatArr.push({type, number, param});
    }

    return heartBeatArr;
  }
}

module.exports = Message;
