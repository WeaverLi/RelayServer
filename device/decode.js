const decodeBody = Symbol('decodeBody');
const byteOffset = 16;

class Decode {
  constructor(buffer) {
    const data = new Uint8Array(buffer);
    const dataHead = new DataView(data.buffer, 0);

    this.type = String.fromCharCode(dataHead.getUint8(1));
    this.length = dataHead.getUint16(2);

    this.token = dataHead.getUint32(4);
    this.netID = dataHead.getUint32(8);
    this.devID = dataHead.getUint32(12);

    this.bodys = this[decodeBody](data.buffer, byteOffset, buffer.length);
  }

  // 私有方法，解码bodys内容
  [decodeBody](buf, offSet, bufLen) {
    const bodys = [];

    if (this.type === 'R') {
      for (let i = 0; offSet + i * 20 + 4 < bufLen; i++) {
        const msgBody = {};
        const bodyItem = new DataView(buf, offSet + i * 20, 20);

        msgBody.val = bodyItem.getUint8(0);
        msgBody.len = bodyItem.getUint16(2);

        let s = 0;
        while (bodyItem.getUint8(4 + s) !== 0) s++;
        const strbuf = new Uint8Array(buf, offSet + i * 20 + 4, s);

        msgBody.name = String.fromCharCode.apply(String, strbuf);

        bodys.push(msgBody);
      }
    }

    return bodys;
  }
}

// 测试解码
const tcode = [126, 82, 0, 40, 0, 0, 0, 17, 0, 0, 34, 0, 0, 51, 0, 0, 1, 2, 0, 20, 104, 101, 108, 108, 111, 32, 119,
  111, 114, 108, 100, 0, 0, 0, 0, 0, 0, 32, 0, 0];
const de = new Decode(tcode);
console.log(de); //解码输出

module.exports = Decode;
