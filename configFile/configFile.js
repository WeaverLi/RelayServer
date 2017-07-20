const fs = require('fs');
const path = require('path');

const Command = require('./command');
const {
  FileInfo,
  CmdInfo,
  TYPE_AC,
  CMD_KEYCODE_BOFU,
  MASK_MASK,
  // MASK_IR,
  MASK_WAVEKC,
  MASK_2262,
  MASK_1527,
  MASK_WAVE,
  MASK_STATE
} = require('./fileTypes');

const {
  readFile,
  readCommand,
  creatFile,
  writeCommand,
  buildBOFU,
  buildACComKey,
  buildTwaveKey,
  getModeByACCKey,
  getTempByACCKey,
  getSpeedByACCKey,
} = require('./loadCfgFile');

class ConfigFile {
  constructor({aid = 0, type = 0, applianceType = '', manufact = '', model = '', cmd = []}) {
    this.aid = aid;                //所属电器id，对无线命令码的生成有作用
    this.type = type;                 //0自定义
    this.applianceType = applianceType;
    this.manufact = manufact;
    this.model = model;

    this.cmds = cmd;                // cmds = new ArrayList<Command>();
    this.map = new Map();
    this.map2 = new Map();
  }

  loadFile(fileName) {
    const fileInfo = new FileInfo();
    const fd = fs.openSync(__dirname + `/${fileName}`,'r');
    if (!fd) return -1;

    // 解析文件并给属性赋值
    const ret = readFile(fd, fileInfo);
    console.log(fileInfo);
    if (ret !== 0 || fileInfo.cmdNum < 0) {
      console.log("indexoffset %u ret %d fileInfo.cmdNum %u", fileInfo.indexOffset, ret, fileInfo.cmdNum);
      console.log("ERROR: read file error,check file format");
      return -2;
    }
    this.type = fileInfo.ekind;
    this.applianceType = fileInfo.etype;
    this.manufact = fileInfo.Manufacturer;
    this.model = fileInfo.model;

    //获得循环次数
    const loopct = (fileInfo.ekind === TYPE_AC) ? fileInfo.indexAreaSize : fileInfo.cmdNum;
    let loaded = 0;

    // 解析命令并给属性赋值
    for (let i = 0; i < loopct; i++) {
      const cmdInfo = new CmdInfo();
      const error = readCommand(fd, fileInfo, cmdInfo, i);

      //不允许length越界的情况
      if (error < 0) {
        if (fileInfo.ekind !== TYPE_AC)
          console.log("cmd NO.%d error = %d,lenth=%d, filesize =%d, cmdoff=%d", i, error, cmdInfo.length, fileInfo.cmdSize, cmdInfo.offset);
        else
          console.log("AC cmd %d error = %d,clenth=%d, cmdSize =%d, cmdoff=%d", i, error, cmdInfo.length, fileInfo.cmdSize, cmdInfo.offset);
      }
      if (cmdInfo.length > fileInfo.cmdSize - fileInfo.cmdHeadSize)
        cmdInfo.length = fileInfo.cmdSize - fileInfo.cmdHeadSize;

      const tmp = Buffer.alloc(160);//自动生成配码命令（根据保存的命令名字）
      let rf = 1;//是否重新创建命令，0表示直接读取文件中的命令码
      if ((fileInfo.ekind & MASK_MASK) === MASK_2262) {// 生成12个2bit，存到12字节中，文件内容无意义
        cmdInfo.length = 12;
        const rfcode = (this.aid & 0xfffff);       //取20bit
        for (let j = 0; j < 10; j++)
          tmp.writeUInt8((rfcode & (0x03 << j)) >> j, j);
        tmp.writeUInt8(i % 3, 10);
        tmp.writeUInt8(i / 3, 11);
      }
      else if ((fileInfo.ekind & MASK_MASK) === MASK_1527) {      // 生成24个1bit，存到24字节中，文件内容无意义
        cmdInfo.length = 24;
        const rfcode = (this.aid & 0x1fffff) | ((i + 1) << 21);   //取21bit,i的3bit最多8个命令
        for (let j = 0; j < 24; j++)
          tmp.writeUInt8((rfcode & (1 << j)) >> j, j);
      }
      else if ((fileInfo.ekind & MASK_MASK) === MASK_WAVEKC) {//根据aid和命令的keycode决定如何生成命令，文件内容无意义
        //前4个字节在文件中应该也有，可以读4个字节，也可以根据key重新生成。
        cmdInfo.length = 4;             //MASK_TWAVE命令前四个字节为发送方式
        tmp.writeUInt8(cmdInfo.key.count, 0);//发几轮，默认1
        tmp.writeUInt8(cmdInfo.key.intval, 1);//时间长度单位，默认20us。
        tmp.writeUInt16BE(0, 2);

        //根据厂家开始生成波形，模块直接发送。
        if (cmdInfo.key.type === CMD_KEYCODE_BOFU)
          cmdInfo.length = buildBOFU(tmp, this.aid, i);
        //不支持的直接返回4，模块不会处理，app可以提示不支持
      }
      else if ((fileInfo.ekind & MASK_MASK) === MASK_STATE) {//状态命令
        cmdInfo.length = 4;//取得key即可，无需读取文件
        tmp.writeUInt8(cmdInfo.key, 0);//状态码，发给设备
        tmp.writeUIntBE(0, 1, 3);

        rf = 0;//还是读文件吧，将忽略上面的tmp
      }
      else if ((fileInfo.ekind & MASK_MASK) === MASK_WAVE) {//通用波形（备用），正常读取文件，直接TWAVE发送
        rf = 0;//命令已经是TWAVE，无须再转
      }
      else//红外调制波形MASK_IR，正常读取文件
        rf = 0;

      let cmdBuffer = Buffer.alloc(cmdInfo.length);
      let cmdArr;
      //读取命令码
      if (rf === 0) {
        fs.readSync(fd, cmdBuffer, 0, cmdInfo.length, cmdInfo.offset)
      }
      else { //创建命令
        cmdBuffer = tmp.readUIntBE(0, cmdInfo.length);
      }

      cmdArr = new Uint8Array(cmdBuffer);
      const command = new Command({
        name: (cmdInfo.name[0] !== 0) ? cmdInfo.name : new Uint8Array(20),
        locale: cmdInfo.locale,
        style: cmdInfo.style,
        cmd: cmdArr
      });

      this.addCommand(cmdInfo.key, command);
      loaded++;
    }

    fs.closeSync(fd);
    console.log("load cmdnum = %d,loop count=%d,loaded=%d. %x", fileInfo.cmdNum, loopct, loaded, fileInfo.ekind);
    return loaded;
  }

  storeFile(fileName) {
    const fileInfo = new FileInfo();
    let sucCount = 0;
    const fd = fs.openSync(__dirname + `/${fileName}`, 'w+');

    if (!fd) {
      console.log("ERROR: open file error !");
      return -1;
    }

    fileInfo.etype = (this.applianceType !== null) ? this.applianceType : 0;
    fileInfo.Manufacturer = (this.manufact !== null) ? this.manufact : 0;
    fileInfo.model = (this.model !== null) ? this.model : 0;
    fileInfo.ekind = this.type;
    if (fileInfo.ekind !== TYPE_AC) {//非红外空调命令
      fileInfo.cmdHeadSize = 32;
      fileInfo.cmdSize = fileInfo.cmdHeadSize + 330;
    }
    else {
      fileInfo.cmdHeadSize = 2;
      fileInfo.cmdSize = fileInfo.cmdHeadSize + 360;
    }

    //配码命令不需要存储，存储也只会使用其名字
    if (((fileInfo.ekind & MASK_MASK) === MASK_2262)
        || ((fileInfo.ekind & MASK_MASK) === MASK_1527)
        || ((fileInfo.ekind & MASK_MASK) === MASK_WAVEKC)
        || ((fileInfo.ekind & MASK_MASK) === MASK_STATE)) {
      console.log("Warning:will create rf file %x", fileInfo.ekind);
      //		finfo.cmdHeadSize = 32;
      //		finfo.cmdSize = 32;//不需要保存命令码
    }

    if (creatFile(fd, fileInfo) < 0) {
      console.log("ERROR: write file error,check file format");
      return -2;
    }

    for (let i = 0; i < this.cmds.length; i++) {
      const cmdInfo = new CmdInfo();

      cmdInfo.locale = this.cmds[i].locale;
      cmdInfo.style = this.cmds[i].style;
      cmdInfo.key = this.cmds[i].key;
      cmdInfo.name = (this.cmds[i].name !== null) ? this.cmds[i].name : 0;
      cmdInfo.length = this.cmds[i].cmd.length;

      if (writeCommand(fd, fileInfo, cmdInfo, this.cmds[i].cmd) >= 0)
        sucCount++;
      else
        console.log("ERROR write command NO.%d", i);
    }

    console.log("store command count = %d", sucCount);
    return sucCount;
  }

  static buildACCKey(mode, onoff, temp, speed) {
    return buildACComKey(mode, onoff, temp, speed);
  }

  static buildTwaveKey(type, intval, repeat) {
    return buildTwaveKey(type, intval, repeat);
  }

  static getACCMode(key) {
    return getModeByACCKey(key);
  }

  static getACCTemp(key) {
    return getTempByACCKey(key);
  }

  static getACCSpeed(key) {
    return getSpeedByACCKey(key);
  }

  //低五位面板类型
  getType() {
    return this.type & 0x1f;
  }

  setType(tp) {
    this.type = (this.type & 0xe0) | (tp & 0x1f);
  }

  getMask() {
    return this.type & 0xe0;
  }

//高三位无线或红外
  setMask(msk) {
    this.type = (msk & 0xe0) | (this.type & 0x1f);
  }

  setAid(id) {
    this.aid = id;
  }

  //传递给模块的version，type
  getVAT() {
    switch (this.type & MASK_MASK) {
      case MASK_2262:
        return 0x11; //T2262
      case MASK_1527:  //T1527
        return 0x21;
      case MASK_WAVEKC://读取后转化为WAVE，对应底层TTWAVE
      case MASK_WAVE:
        return 0x31;
      case MASK_STATE://TONOFF
        return 0x41;
    }
    return 0x01;
  }

  getParam() {
    return 0;
  }

  addCommand(key, cmd) {
    cmd.key = key;

    if (this.type === TYPE_AC) {//是空调命令
      // cmd.name = BasicTypes.GetNameByKey(key);    // 这里有问题？？？？？
      if (this.map.has(key)) {
        const index = this.cmds.findIndex(value => value === this.map.get(cmd.key));
        this.cmds[index] = cmd;
      }
      else {
        this.cmds.push(cmd);
      }
      this.map.set(key, cmd);
      this.map2.set(cmd.name, cmd);
    }
    else {
      if (this.map2.has(cmd.name)) {
        const index = this.cmds.findIndex(value => value === this.map2.get(cmd.name));
        this.cmds[index] = cmd;
      }
      else {
        this.cmds.push(cmd);
      }
      this.map2.set(cmd.name, cmd);
    }

    return this.cmds.length;
  }

  delCommand(cmd) {
    const index = this.cmds.findIndex(value => value === this.map2.get(cmd.name));
    this.cmds.splice(index, 1);

    if (this.type === TYPE_AC) {
      this.map.delete(cmd.key);
      this.map2.delete(cmd.name);
    }
    else
      this.map2.delete(cmd.name);

    return this.cmds.length;
  }

  getCommand({key = null, name = null}) {
    //也可以按照index的方式取
    if (key !== null && name === null) {
      if (this.map.size === 0 && key < this.cmds.length)
        return this.cmds[key];
      return this.map.get(key);
    }
    else if (key === null && name !== null) {
      return this.map2.get(name);
    }
    else {
      return new Error('input error!');
    }
  }
}

module.exports = ConfigFile;