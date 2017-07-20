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
  constructor({type, token, netID, devID}) {  // 编码时需给定type,token,netID,devID,解码时都不需要给定
    this.type = type || '';
    this.length = 20;
    this.token = token || 0;
    this.netID = netID || 0;
    this.devID = devID || 0;
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
    const buffer = new ArrayBuffer(this.length);

    const bufferHead = new DataView(buffer, 0);
    const bufferBodyArr = [];
    // const dataBody = new DataView(buffer, byteOffset, this.length - 20);

    let newOffset = byteOffset;
    for (let i = 0; i < this.bodys.length; i++) {
      for (let j = 0; j < i; j++) {
        newOffset += 4 + this.bodys[j].rLen;
      }
      bufferBodyArr.push(new DataView(buffer, newOffset, this.bodys[i].rLen + 4));
    }

    this[encodeHead](bufferHead);
    this[encodeBody](bufferBodyArr);

    // return Array.apply([], new Uint8Array(buffer));
    return buffer;
  }

  // 解码
  decode(buffer) {
    const data = new Uint8Array(buffer);
    const bufferHead = new DataView(data.buffer, 0, byteOffset);
    const bufferBody = new DataView(data.buffer, byteOffset, buffer.byteLength - 20);

    this.type = String.fromCharCode(bufferHead.getUint8(1));
    this.length = bufferHead.getUint16(2);

    this.token = bufferHead.getUint32(4);
    this.netID = bufferHead.getUint32(8);
    this.devID = bufferHead.getUint32(12);

    this.bodys = this[decodeBody](bufferBody);

    return this;
  }


  // 私有方法，编码头部
  [encodeHead](bufferHead) {
    bufferHead.setUint8(0, 0x7e);
    bufferHead.setUint8(1, this.type.charCodeAt(0));
    bufferHead.setUint16(2, this.length);

    bufferHead.setUint32(4, this.token);
    bufferHead.setUint32(8, this.netID);
    bufferHead.setUint32(12, this.devID);

    bufferHead.setUint16(this.length - 4, 0x0002);
    bufferHead.setUint16(this.length - 2, 0);
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
              bufferBodyArr[i].setUint8(0, 0x01);
              bufferBodyArr[i].setUint8(1, this.bodys[i].rCnt);
              bufferBodyArr[i].setUint16(2, this.bodys[i].rLen);

              bufferBodyArr[i].setUint32(4, this.bodys[i].devID);
              bufferBodyArr[i].setUint32(8, this.bodys[i].token);
              bufferBodyArr[i].setUint32(12, this.bodys[i].ts);
              break;
            case 2:
              bufferBodyArr[i].setUint8(0, 0x02);
              bufferBodyArr[i].setUint8(1, this.bodys[i].rCnt);
              bufferBodyArr[i].setUint16(2, this.bodys[i].rLen);

              bufferBodyArr[i].setUint32(4, this.bodys[i].token);
              bufferBodyArr[i].setUint32(8, this.bodys[i].ts);
              break;
            default:
              break;
          }
          break;

        case 'M':
          bufferBodyArr[i].setUint8(0, this.bodys[i].chnlType);
          bufferBodyArr[i].setUint8(1, this.bodys[i].chnlNumber);
          bufferBodyArr[i].setUint16(2, this.bodys[i].chnlParam);

          bufferBodyArr[i].setUint16(0, this.bodys[i].length);
          bufferBodyArr[i].setUint8(2, this.bodys[i].mVer * 16 * 16 + this.bodys[i].mType);
          bufferBodyArr[i].setUint8(3, this.bodys[i].mParam);

          for (let j = 0; j < this.bodys[i].cmds.byteLength; j++) {
            bufferBodyArr[i].setUint8(j, this.bodys[i].cmds[j]);
          }
          break;

        case 'H':
          bufferBodyArr[i].setUint8(0, this.bodys[i].chnlType);
          bufferBodyArr[i].setUint8(1, this.bodys[i].chnlNumber);
          bufferBodyArr[i].setUint16(2, this.bodys[i].chnlParam);
          break;

        case 'm':  // 不应存在编码
          break;

        case 'h':  // 不应存在编码
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
      const bodyLen = bufferBody.getUint8(1) + 1;

      for (let i = 0; i < bodyLen; i++) {
        if (i === 0) {
          pointer[0] = 0;
        }
        else {
          pointer[i] = pointer[i - 1] + bufferBody.getUint16(pointer[i - 1] + 2) + 4;
        }
      }

      for (let i = 0; i < bodyLen; i++) {
        switch (this.type) {
          case 'R':
            switch (bufferBody.getUint8(pointer[i])) {
              case 0x01:
                if (this.netID === 0 && this.devID === 0) { // 注册
                  bodys[i] = {
                    rType: bufferBody.getUint8(pointer[i]),
                    rCnt: bufferBody.getUint8(pointer[i] + 1),
                    rLen: bufferBody.getUint16(pointer[i] + 2),

                    devType: bufferBody.getUint32(pointer[i] + 4),
                    hVer: bufferBody.getUint16(pointer[i] + 8),
                    sVer: bufferBody.getUint16(pointer[i] + 10),
                    devName: this[decodeStr](bufferBody, pointer[i] + 12, 32),
                    seriaNo: this[decodeStr](bufferBody, pointer[i] + 44, 32)
                  }
                } else {                                    // 登录
                  bodys[i] = {
                    rType: bufferBody.getUint8(pointer[i]),
                    rCnt: bufferBody.getUint8(pointer[i] + 1),
                    rLen: bufferBody.getUint16(pointer[i] + 2),

                    devType: bufferBody.getUint32(pointer[i] + 4),
                    hVer: bufferBody.getUint16(pointer[i] + 8),
                    sVer: bufferBody.getUint16(pointer[i] + 10),
                    devName: this[decodeStr](bufferBody, pointer[i] + 12, 32),
                    seriaNo: this[decodeStr](bufferBody, pointer[i] + 44, 32)
                  }
                }
                break;

              case 0x02:
                bodys[i] = {
                  rType: bufferBody.getUint8(pointer[i]),
                  rCnt: bufferBody.getUint8(pointer[i] + 1),
                  rLen: bufferBody.getUint16(pointer[i] + 2),

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
              chnlType: bufferBody.getUint8(pointer[i]),
              chnlNumber: bufferBody.getUint8(pointer[i] + 1),
              chnlParam: bufferBody.getUint16(pointer[i] + 2)
            };
            break;
          default:
            break;
        }
      }
    }

    return bodys;
  }

  // 私有方法，解码字符串码
  [decodeStr](dataView, offset, byteLen) {
    let strLen = 0;
    while (dataView.getUint8(offset + strLen) !== 0) strLen++;

    if (strLen <= byteLen) {
      const strbuf = new Uint8Array(dataView.buffer, offset, strLen);
      return String.fromCharCode.apply(String, strbuf);
    }
    else {
      console.log(new Error('string outside the bounds of the DatatView!'));
    }
  }

  // 私有方法，解码心跳响应数组内容
  [decodeHeartBeatArr](dataView, offset, byteLen) {
    const heartBeatArr = [];

    for (let i = 0; i < 16; i++) {
      const type = dataView.getUint8(offset + i * 4);
      const number = dataView.getUint8(offset + i * 4 + 1);
      const param = dataView.getUint16(offset + i * 4 + 2);
      heartBeatArr.push({type, number, param});
    }

    return heartBeatArr;
  }
}

module.exports = Message;
