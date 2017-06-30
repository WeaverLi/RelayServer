const encodeHead = Symbol('encodeHead');
const encodeBody = Symbol('encodeBody');
const byteOffset = 16;

const MSG_R_BODY = {len: 20, name: '', val: 0};
const MSG_r_BODY = {a: 0, b: '', c: 0};
const MSG_M_BODY = {/*???*/};
const MSG_H_BODY = {/*???*/};

// 生成对应类型的数据格式
class CreateMsg {
  constructor({type, token, netID, devID}) {
    this.type = type;
    this.length = 20;
    this.token = token;
    this.netID = netID;
    this.devID = devID;
    this.bodys = [];
  }

  addBody(msgBody) {
    switch (this.type) {
      case 'R':
        this.bodys.push(Object.assign(MSG_R_BODY, msgBody));
        this.length += 20;
        break;
      case 'r':
        this.bodys.push(Object.assign(MSG_r_BODY, msgBody));
        this.length += 20;
        break;
      case 'M':
        this.bodys.push(Object.assign(MSG_M_BODY, msgBody));
        this.length += 20;
        break;
      case 'H':
        this.bodys.push(Object.assign(MSG_H_BODY, msgBody));
        this.length += 20;
        break;
    }
  }
}

class Encode {
  constructor(msg) {
    this.type = msg.type;
    this.length = msg.length;
    this.token = msg.token;
    this.netID = msg.netID;
    this.devID = msg.devID;
    this.bodys = msg.bodys;
  }

  // 编码
  toBytes() {
    const buffer = new ArrayBuffer(this.length);

    const dataHead = new DataView(buffer, 0);
    const dataBody = new DataView(buffer, byteOffset, this.length - 20);

    this[encodeHead](dataHead);
    this[encodeBody](dataBody);

    return Array.apply([], new Uint8Array(buffer));

  }

  // 私有方法，编码头部
  [encodeHead](head) {
    head.setUint8(0, 0x7e);
    head.setUint8(1, this.type.charCodeAt(0));
    head.setUint16(2, this.length);

    head.setUint32(4, this.token);
    head.setUint32(8, this.netID);
    head.setUint32(12, this.devID);

    head.setUint16(this.length - 4, 0x0020);
    head.setUint16(this.length - 2, 0);
  }

  // 私有方法，编码bodys
  [encodeBody](body) {
    for (let i = 0; i < this.bodys.length; i++) {
      body.setUint8(i * 20, 0x01);
      body.setUint8(1 + i * 20, 0x02);
      body.setUint16(2 + i * 20, this.bodys[i].len);

      let strLen = this.bodys[i].name.length;
      if (strLen > 16) strLen = 16;
      for (let j = 0; j < strLen; j++) {
        body.setUint8(4 + i * 20 + j, this.bodys[i].name.charCodeAt(j));
      }

      body.setUint8(4 + i * 20 + strLen, 0);
    }
  }
}

/* 测试编码 */

// 生成对应类型的数据编码格式
const Msg = new CreateMsg({type: 'R', token: 17, netID: 8704, devID: 3342336});
Msg.addBody({name: 'hello world'});
console.log(Msg);

// 编码
const en = new Encode(Msg);
console.log(en.toBytes());  //编码输出
