/*
 错误码对照表
 -1 ：写空调命令越界
 -2 ：读空调命令越界
 -3 ：读其他电器命令越界
 -4 ：命令偏移越界
 -5 ：读文件失败
 */

const {FileInfo, CmdInfo, CmdKeyCode, T_AC} = require('./fileTypes');

const readFile = (fileBuffer) => {
  const fileInfo = FileInfo;

  // 返回-5 ：读文件失败
  if (fileBuffer.byteLength < 8) {
    return -5;
  }

  fileInfo.version = fileBuffer.readInt8(0);
  fileInfo.ekind = fileBuffer.readInt8(1);
  fileInfo.indexOffset = fileBuffer.readInt16BE(2);
  fileInfo.cmdOffset = fileBuffer.readInt16BE(4);
  fileInfo.headCRC = fileBuffer.readInt16BE(6);

  fileInfo.etype = readStr(fileBuffer, 8, 16);
  fileInfo.Manufacturer = readStr(fileBuffer, 24, 16);
  fileInfo.model = readStr(fileBuffer, 40, 32);

  // fileInfo.panelHeight = fileBuffer.getUint16(72);
  // fileInfo.panelWidth = fileBuffer.getUint16(74);

  fileInfo.indexAreaSize = fileBuffer.readInt16BE(fileInfo.indexOffset);
  fileInfo.idxSize = fileBuffer.readInt16BE(fileInfo.indexOffset + 2);
  fileInfo.cmdHeadSize = fileBuffer.readInt8(fileInfo.indexOffset + 1);

  fileInfo.cmdSize = fileBuffer.readInt16BE(fileInfo.indexOffset + 1);

  fileInfo.fileSize = fileBuffer.byteLength;
  fileInfo.cmdNum = (fileInfo.fileSize - fileInfo.cmdOffset) / fileInfo.cmdSize;

  return fileInfo;
};

const readCommand = (fileBuffer, fileInfo, index) => {
  const cmdInfo = CmdInfo;

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
      cmdInfo.locale = fileBuffer.readInt32BE(fileInfo.cmdOffset + index * fileInfo.cmdSize);
      cmdInfo.style = fileBuffer.readInt32BE(fileInfo.cmdOffset + index * fileInfo.cmdSize + 4);
      cmdInfo.key = fileBuffer.readInt16BE(fileInfo.cmdOffset + index * fileInfo.cmdSize + 8);
      cmdInfo.name = readStr(fileBuffer, fileInfo.cmdOffset + index * fileInfo.cmdSize + 10, 20);
    }
    cmdInfo.length = fileBuffer.readInt16BE(fileInfo.cmdOffset + index * fileInfo.cmdSize + 30);
  }
  //有索引表的情况，目前就是空调
  else if (fileInfo.idxSize === 2) {
    const realIndexAreaSize = (fileInfo.cmdOffset - fileInfo.indexOffset - 6) / fileInfo.idxSize;
    const content = fileBuffer.readInt16BE(fileInfo.indexOffset + 6 + index * 2);
    if (content === 0xffff) return -1;

    cmdInfo.key = index;
    cmdInfo.offset = fileInfo.cmdOffset + content * fileInfo.cmdSize + fileInfo.cmdHeadSize;

    if (cmdInfo.offset > fileInfo.fileSize) {
      return -4;      // 返回-4 ：命令偏移越界
    }

    //表示有cmdhead的结构
    if (fileInfo.cmdHeadSize === 32) {
      cmdInfo.locale = fileBuffer.readInt32BE(fileInfo.cmdOffset + index * fileInfo.cmdSize);
      cmdInfo.style = fileBuffer.readInt32BE(fileInfo.cmdOffset + index * fileInfo.cmdSize + 4);
      cmdInfo.key = fileBuffer.readInt16BE(fileInfo.cmdOffset + index * fileInfo.cmdSize + 8);
      cmdInfo.name = readStr(fileBuffer, fileInfo.cmdOffset + index * fileInfo.cmdSize + 10, 20);
    }
    cmdInfo.length = fileBuffer.readInt16BE(fileInfo.cmdOffset + index * fileInfo.cmdSize + 30);
  }

  return cmdInfo;
};

const creatFile = (fileBuffer, fileInfo) => {
  //在外面先打开文件*file，如果不存在，则新建文件
  if (fileInfo === null) {
    return -1;
  }

  //判断是否是已存在的合法文件
  if (typeof readFile(fileBuffer) === 'object') {
    writeStr(fileInfo.etype, 8, 16, fileBuffer);
    writeStr(fileInfo.Manufacturer, 24, 16, fileBuffer);
    writeStr(fileInfo.model, 40, 32, fileBuffer);

    const newFileInfo = readFile(fileBuffer);
    return {
      fileBuffer,
      fileInfo: newFileInfo
    }
  }

  fileInfo.version = 1;
  fileInfo.indexOffset = 76;

  //如果是空调
  if (fileInfo.ekind === T_AC) {
    fileInfo.indexAreaSize = 512;
    fileInfo.idxSize = 2;
    writeStr(0xff, fileInfo.indexOffset + 6, fileInfo.indexAreaSize * fileInfo.idxSize, fileBuffer);
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
  fileBuffer.writeInt8(fileInfo.version, 0);
  fileBuffer.writeInt8(fileInfo.ekind, 1);
  fileBuffer.writeInt16BE(fileInfo.indexOffset, 2);
  fileBuffer.writeInt16BE(fileInfo.cmdOffset, 4);
  fileBuffer.writeInt16BE(fileInfo.headCRC, 6);

  writeStr(fileInfo.etype, 8, 16, fileBuffer);
  writeStr(fileInfo.Manufacturer, 24, 16, fileBuffer);
  writeStr(fileInfo.model, 40, 32, fileBuffer);

  fileBuffer.writeInt16BE(fileInfo.panelHeight, 72);
  fileBuffer.writeInt16BE(fileInfo.panelWidth, 74);

  fileBuffer.writeInt16BE(fileInfo.indexAreaSize, 76);
  fileBuffer.writeInt8(fileInfo.idxSize, 78);
  fileBuffer.writeInt8(fileInfo.cmdHeadSize, 79);
  fileBuffer.writeInt16BE(fileInfo.cmdSize, 80);

  return {
    fileBuffer,
    fileInfo
  }
};

const writeCommand = (fileBuffer, fileInfo, cmdInfo, ptr) => {
  if (fileInfo === null) {
    const newFileInfo = readFile(fileBuffer);
  }

  // 空调，写索引区
  if (fileInfo.ekind === T_AC) {
    //首先判断cinfo->key是否越界，正常情况是key 0...511
    if ((cmdInfo.key >= fileInfo.indexAreaSize)) {
      return -1;          // 返回-1 ：写空调命令越界
    }
    let tmp = 0;
    for (let i = 0; i < fileInfo.indexAreaSize; i++) {
      const bh = fileBuffer.readInt16BE(fileInfo.indexOffset + 6 + i * 2);
      if (((bh + 1) > tmp) && (bh !== 0xffff)) {
        tmp = bh + 1;
      }
    }

    fileBuffer.writeInt16BE(tmp, fileInfo.indexOffset + 6 + cmdInfo.key * 2);
  }

  let newFileBuffer = null;
  if (fileInfo.cmdHeadSize === 32) {
    const addBuffer = Buffer.alloc(32 + fileInfo.cmdSize - fileInfo.cmdHeadSize);
    addBuffer.writeInt32BE(cmdInfo.locale, 0);
    addBuffer.writeInt32BE(cmdInfo.style, 4);
    addBuffer.writeInt16BE(cmdInfo.key, 8);
    writeStr(cmdInfo.name, 10, 20, addBuffer);
    if (cmdInfo.length > fileInfo.cmdSize - fileInfo.cmdHeadSize)
      cmdInfo.length = fileInfo.cmdSize - fileInfo.cmdHeadSize;
    addBuffer.writeInt16BE(cmdInfo.length, 30);
    //保证写满命令项应有的长度
    writeCmd(ptr, 32, fileInfo.cmdSize - fileInfo.cmdHeadSize, addFlieBuffer);

    newFileBuffer = Buffer.concat([fileBuffer, addBuffer]);
  }

  return {
    fileInfo,
    fileBuffer: (newFileBuffer === null) ? fileBuffer : newFileBuffer
  }
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
  // const cmdKeyCode = CmdKeyCode;
  // cmdKeyCode.type=type;        //5bit
  // cmdKeyCode.count=repeat;     //3bit
  // cmdKeyCode.intval=intval;    //8bit
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
  const Arr = [];
  for (let i = 0; i < len; i++) {
    Arr.push(fileBuffer.readInt8(start + i));
  }
  return Arr;
}

function writeStr(bufferArr, start, len, fileBuffer) {
  for (let i = 0; i < len; i++) {
    fileBuffer.writeInt8(bufferArr[i], start + i);
  }
  return fileBuffer;
}

function writeCmd(ptr, start, len, fileBuffer) {
  for (let i = 0; i < len / 4; i++) {
    fileBuffer.writeInt32BE(ptr, start + i * 4);
  }
  return fileBuffer;
}

module.exports = {
  readFile,            // readFile(fileBuffer); 参数fileBuffer为文件的Buffer对象，返回成功为fileInfo,失败为为错误码
  readCommand,         // readCommand(fileBuffer,fileInfo,index); 参数index为，返回成功为cmdInfo,失败为错误码
  creatFile,           // creatFile(fileBuffer,fileInfo); 参数，返回成功为fileBuffer,fileInfo,失败为错误码
  writeCommand,        // writeCommand(fileBuffer,fileInfo,cmdInfo,ptr); 参数ptr为，返回成功为fileBuffer,fileInfo,失败为错误码
  buildACComKey,       // buildACComKey(mode, onoff, temp, speed);参数,返回为accout
  buildTwaveKey,       // buildTwaveKey(type, intval, repeat);参数，返回accout
  getModeByACCKey,
  getTempByACCKey,
  getSpeedByACCKey,
  getFanByACCKey
};