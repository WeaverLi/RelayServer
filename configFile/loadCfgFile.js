/*
 错误码对照表
 -1 ：写空调命令越界
 -2 ：读空调命令越界
 -3 ：读其他电器命令越界
 -4 ：命令偏移越界
 -5 ：读文件失败
 */
const fs = require('fs');
const {FileInfo, TYPE_AC} = require('./fileTypes');

const readFile = (fileBuffer, fileInfo) => {
  // 返回-5 ：读文件失败
  if (fileBuffer.byteLength < 8) {
    return -5;
  }

  fileInfo.version = fileBuffer.readUInt8(0);
  fileInfo.ekind = fileBuffer.readUInt8(1);
  fileInfo.indexOffset = fileBuffer.readUInt16LE(2);
  fileInfo.cmdOffset = fileBuffer.readUInt16LE(4);
  fileInfo.headCRC = fileBuffer.readUInt16LE(6);

  fileInfo.etype = readStr(fileBuffer, 8, 16);
  fileInfo.Manufacturer = readStr(fileBuffer, 24, 16);
  fileInfo.model = readStr(fileBuffer, 40, 32);

  fileInfo.panelHeight = fileBuffer.readUInt16LE(72);
  fileInfo.panelWidth = fileBuffer.readUInt16LE(74);

  fileInfo.indexAreaSize = fileBuffer.readUInt16LE(fileInfo.indexOffset);
  fileInfo.idxSize = fileBuffer.readUInt8(fileInfo.indexOffset + 2);
  fileInfo.cmdHeadSize = fileBuffer.readUInt8(fileInfo.indexOffset + 3);

  fileInfo.cmdSize = fileBuffer.readUInt16LE(fileInfo.indexOffset + 4);

  fileInfo.fileSize = fileBuffer.byteLength;
  fileInfo.cmdNum = (fileInfo.fileSize - fileInfo.cmdOffset) / fileInfo.cmdSize;

  return 0;
};

const readCommand = (fileBuffer, fileInfo, cmdInfo, index) => {
  // 无索引表的情况，目前表示除空调外的其他电器
  if (fileInfo.idxSize === 0) {
    //判断配置文件是否存储了多于（index+1）条命令,否则index越界
    if ((index + 1) > fileInfo.cmdNum) {
      //读其他电器命令越界
      return -3;
    }
    cmdInfo.key = 0;//index;//非空调电器，这个key用来存CmdKeyCode结构，后面会从文件中读出来
    cmdInfo.offset = fileInfo.cmdOffset + index * fileInfo.cmdSize + fileInfo.cmdHeadSize;

    if (cmdInfo.offset > fileInfo.fileSize) {
      return -4;   // 返回-4 ：命令偏移越界
    }

    //表示有cmdhead的结构
    if (fileInfo.cmdHeadSize === 32) {
      cmdInfo.locale = fileBuffer.readUInt32LE(fileInfo.cmdOffset + index * fileInfo.cmdSize);
      cmdInfo.style = fileBuffer.readUInt32LE(fileInfo.cmdOffset + index * fileInfo.cmdSize + 4);
      cmdInfo.key = fileBuffer.readUInt16LE(fileInfo.cmdOffset + index * fileInfo.cmdSize + 8);
      cmdInfo.name = readStr(fileBuffer, fileInfo.cmdOffset + index * fileInfo.cmdSize + 10, 20);
      cmdInfo.length = fileBuffer.readUInt16LE(fileInfo.cmdOffset + index * fileInfo.cmdSize + 30);
    }
  }
  //有索引表的情况，目前就是空调
  else if (fileInfo.idxSize === 2) {
    // const realIndexAreaSize = (fileInfo.cmdOffset - fileInfo.indexOffset - 6) / fileInfo.idxSize;
    const content = fileBuffer.readUInt16LE(fileInfo.indexOffset + 6 + index * 2);
    if (content === 0xffff) return -1;

    cmdInfo.key = index;
    cmdInfo.offset = fileInfo.cmdOffset + content * fileInfo.cmdSize + fileInfo.cmdHeadSize;

    if (cmdInfo.offset > fileInfo.fileSize) {
      return -4;      // 返回-4 ：命令偏移越界
    }

    //表示有cmdhead的结构
    // if (fileInfo.cmdHeadSize === 32) {
    //   cmdInfo.locale = fileBuffer.readUInt32LE(fileInfo.cmdOffset + index * fileInfo.cmdSize);
    //   cmdInfo.style = fileBuffer.readUInt32LE(fileInfo.cmdOffset + index * fileInfo.cmdSize + 4);
    //   cmdInfo.key = fileBuffer.readUInt16LE(fileInfo.cmdOffset + index * fileInfo.cmdSize + 8);
    //   cmdInfo.name = readStr(fileBuffer, fileInfo.cmdOffset + index * fileInfo.cmdSize + 10, 20);
    //   cmdInfo.length = fileBuffer.readUInt16LE(fileInfo.cmdOffset + index * fileInfo.cmdSize + 30);
    // }
    cmdInfo.length = fileBuffer.readUInt16LE(cmdInfo.offset - fileInfo.cmdHeadSize);
  }

  return 0;
};

const creatFile = (fd, fileInfo) => {
  //在外面先打开文件*file，如果不存在，则新建文件
  if (fileInfo === null) {
    return -1;
  }

  const newFileInfo = new FileInfo();
  const newFileBuffer = fs.readFileSync(fd);
  //判断是否是已存在的合法文件,是则可能改变fileInfo
  if (readFile(newFileBuffer, newFileInfo) === 0) {
    fs.writeSync(fd, fileInfo.etype, 0, 16, 8);
    fs.writeSync(fd, fileInfo.Manufacturer, 0, 16, 24);
    fs.writeSync(fd, fileInfo.model, 0, 32, 40);

    readFile(newFileBuffer, fileInfo);
    return 0;
  }

  fileInfo.version = 1;
  fileInfo.indexOffset = 76;

  //如果是空调
  if (fileInfo.ekind === TYPE_AC) {
    fileInfo.indexAreaSize = 512;
    fileInfo.idxSize = 2;
    fs.writeSync(fd, Buffer.alloc(fileInfo.indexAreaSize * fileInfo.idxSize, 0xff), 0, fileInfo.indexAreaSize * fileInfo.idxSize, fileInfo.indexOffset + 6);
  }
  // 其它电器
  else {
    fileInfo.indexAreaSize = 0;
    fileInfo.idxSize = 0;
  }

  fileInfo.cmdOffset = fileInfo.indexOffset + 6 + fileInfo.idxSize * fileInfo.indexAreaSize;//2128
  fileInfo.headCRC = 0x5555;

  fileInfo.panelWidth = 1;
  fileInfo.panelHeight = 2;

  // 写文件
  const headBuffer = Buffer.alloc(82);
  headBuffer.writeUInt8(fileInfo.version, 0);
  headBuffer.writeUInt8(fileInfo.ekind, 1);
  headBuffer.writeUInt16LE(fileInfo.indexOffset, 2);
  headBuffer.writeUInt16LE(fileInfo.cmdOffset, 4);
  headBuffer.writeUInt16LE(fileInfo.headCRC, 6);

  writeStr(fileInfo.etype, 8, 16, headBuffer);
  writeStr(fileInfo.Manufacturer, 24, 16, headBuffer);
  writeStr(fileInfo.model, 40, 32, headBuffer);

  headBuffer.writeUInt16LE(fileInfo.panelHeight, 72);
  headBuffer.writeUInt16LE(fileInfo.panelWidth, 74);

  headBuffer.writeUInt16LE(fileInfo.indexAreaSize, 76);
  headBuffer.writeUInt8(fileInfo.idxSize, 78);
  headBuffer.writeUInt8(fileInfo.cmdHeadSize, 79);
  headBuffer.writeUInt16LE(fileInfo.cmdSize, 80);

  console.log(headBuffer);
  fs.writeSync(fd, headBuffer, 0, 82, 0);
  return 0;
};

const writeCommand = (fd, fileInfo, cmdInfo, cmd) => {
  if (fileInfo === null) {
    const newFileInfo = new FileInfo();
    const newFileBuffer = fs.readFileSync(fd);
    readFile(newFileBuffer, newFileInfo);
    fileInfo = newFileInfo;
  }

  // 空调，写索引区
  if (fileInfo.ekind === TYPE_AC) {
    //首先判断cinfo->key是否越界，正常情况是key 0...511
    if ((cmdInfo.key >= fileInfo.indexAreaSize)) {
      return -1;          // 返回-1 ：写空调命令越界
    }
    let tmp = 0;
    for (let i = 0; i < fileInfo.indexAreaSize; i++) {
      const bh = Buffer.alloc(2);
      fs.readSync(fd, bh, 0, 2, fileInfo.indexOffset + 6 + i * 2);
      if (((bh.readUInt16LE(0) + 1) > tmp) && (bh.readUInt16LE(0) !== 0xffff)) {
        tmp = bh.readUInt16LE(0) + 1;
      }
    }

    fs.writeSync(fd, tmp, 0, 2, fileInfo.indexOffset + 6 + cmdInfo.key * 2);
  }

  const appendBuffer1 = Buffer.alloc(32 + fileInfo.cmdSize - fileInfo.cmdHeadSize);
  const appendBuffer2 = Buffer.alloc(2 + fileInfo.cmdSize - fileInfo.cmdHeadSize);

  if (fileInfo.cmdHeadSize === 32) {
    appendBuffer1.writeUInt32LE(cmdInfo.locale, 0);
    appendBuffer1.writeUInt32LE(cmdInfo.style, 4);
    appendBuffer1.writeUInt16LE(cmdInfo.key, 8);
    writeStr(cmdInfo.name, 10, 20, appendBuffer1);
    if (cmdInfo.length > fileInfo.cmdSize - fileInfo.cmdHeadSize)
      cmdInfo.length = fileInfo.cmdSize - fileInfo.cmdHeadSize;
    appendBuffer1.writeUInt16LE(cmdInfo.length, 30);
    //保证写满命令项应有的长度
    writeCmd(cmd, 32, fileInfo.cmdSize - fileInfo.cmdHeadSize, appendBuffer1);

    fs.appendFileSync(fd, appendBuffer1);
  } else {
    if (cmdInfo.length > fileInfo.cmdSize - fileInfo.cmdHeadSize)
      cmdInfo.length = fileInfo.cmdSize - fileInfo.cmdHeadSize;
    appendBuffer2.writeUInt16LE(cmdInfo.length, 0);
    //保证写满命令项应有的长度
    writeCmd(cmd, 32, fileInfo.cmdSize - fileInfo.cmdHeadSize, appendBuffer2);

    fs.appendFileSync(fd, appendBuffer2);
  }

  return 0;
};


const buildBOFU = (cmd, aid, i) => {
  const tmp = [];
  const action = [0x43, 0x13, 0x53, 0xc3];                 //第3字节动作码（通道1）：配码0100，开0001，停0101，关1100

  if (i < 0 || i > 4)									//自定义4个命令，依次为：配码，开，停，关
    return 0;
  tmp[0] = (aid & 0xff);
  tmp[1] = (aid & 0xff00) >> 8;
  tmp[2] = action[i];
  tmp[3] = 0x01;									  //模拟BF-101发射器
  tmp[4] = 1 - (tmp[0] + tmp[1] + tmp[2] + tmp[3]); //校验
                                                    //将5字节编为波形
  cmd.writeInt8(8, 0);
  cmd.writeInt8(20, 1);
  cmd.writeInt8(100, 4);
  cmd.writeInt8(100, 5);
  cmd.writeInt8(100, 6);
  cmd.writeInt8(100 | 0x80, 7);
  cmd.writeInt8(50 | 0x80, 8);
  cmd.writeInt8(100, 9);
  cmd.writeInt8(20 | 0x80, 10);

  // 5个8字节，bofu的先发低位   //80字节
  for (let j = 0; j < 5; j++) {
    let high = tmp[j];
    for (let k = 0; k < 8; k++) {
      if (high & 0x01) {
        cmd.writeInt8(33, j * 8 * 2 + k * 2 + 1);
        cmd.writeInt8(17 | 0x80, j * 8 * 2 + k * 2 + 2);
      } else {
        cmd.writeInt8(17, j * 8 * 2 + k * 2 + 1);
        cmd.writeInt8(33 | 0x80, j * 8 * 2 + k * 2 + 2);
      }
      high >>= 1;
    }
  }

  cmd.writeInt8(20, 91);
  return (5 * 16 + 8) + 4;            // 92
};


const buildACComKey = (mode, onoff, temp, speed) => {
  let accout = 0;
  mode &= 0x0007; //0-7,实际0-3。4和5特殊处理了

  if (mode > 4) {                    //关机
    accout = 0x01e0; //1111 00 00 0
  }
  else if (mode === 4) {                    //自动
    accout = 0x01f8; //1111 11 00 0
  }
  else { //0...3      0000 00 00 0 ... 1110 11 11 1
    temp &= 0x000f;
    speed &= 0x0003;
    onoff &= 0x0001;

    accout |= temp << 5;
    accout |= mode << 3;
    accout |= speed << 1;
    accout |= onoff;
  }
  return accout;
};

const buildTwaveKey = (type, intval, repeat) => {
  let accout = 0x0000;
  accout |= type << 11;
  accout |= repeat << 8;
  accout |= intval;

  return accout;
};

const getModeByACCKey = key => {
  if (key === 0x01e0)
    return 5;
  else if (key === 0x01f8)
    return 4;
  return (key & 0x18) >> 3;
};

const getTempByACCKey = key => {
  return (key & 0x1e0) >> 5;
};

const getSpeedByACCKey = key => {
  return (key & 0x6) >> 1;
};

const getFanByACCKey = key => {
  return (key & 0x1);
};

// 辅助函数
function readStr(fileBuffer, start, len) {
  const Arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    Arr[i] = fileBuffer.readUInt8(start + i);
  }
  return Arr;
}

function writeStr(uint8Arr, start, len, buffer) {
  if (typeof uint8Arr === 'object') {
    for (let i = 0; i < len; i++)
      buffer.writeUInt8(uint8Arr[i], start + i);
  } else if (typeof uint8Arr === 'number') {
    for (let i = 0; i < len; i++)
      buffer.writeUInt8(uint8Arr, start + i);
  }
  return buffer;
}

function writeCmd(ptr, start, len, fileBuffer) {
  for (let i = 0; i < len; i++) {
    fileBuffer.writeUInt8(ptr[i], start + i);
  }
  return fileBuffer;
}

function strToUint8Arr(str, len) {
  const Arr = new Uint8Array(len);
  for (let i = 0; i < str.length; i++)
    Arr[i] = str.charCodeAt(i);
  return Arr;
}

module.exports = {
  readFile,            // readFile(fileBuffer); 参数fileBuffer为文件的Buffer对象，返回成功为fileInfo,失败为为错误码
  readCommand,         // readCommand(fileBuffer,fileInfo,index); 参数index为，返回成功为cmdInfo,失败为错误码
  creatFile,           // creatFile(fileBuffer,fileInfo); 参数，返回成功为fileBuffer,fileInfo,失败为错误码
  writeCommand,        // writeCommand(fileBuffer,fileInfo,cmdInfo,ptr); 参数ptr为，返回成功为fileBuffer,fileInfo,失败为错误码
  buildBOFU,           // buildBOFU(cmd,aid,i);参数cmd为Buffer,返回成功为92（cmd的92字节处）,失败为错误码
  buildACComKey,       // buildACComKey(mode, onoff, temp, speed);参数,返回为accout
  buildTwaveKey,       // buildTwaveKey(type, intval, repeat);参数，返回accout
  getModeByACCKey,
  getTempByACCKey,
  getSpeedByACCKey,
  getFanByACCKey,
  strToUint8Arr
};