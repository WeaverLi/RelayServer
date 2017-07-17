const fs = require('fs');
const path = require('path');

const Command=require('./command');

const {
  readFile,
  readCommand,
  creatFile,
  writeCommand,
  buildACComKey,
  buildTwaveKey,
  getModeByACCKey,
  getTempByACCKey,
  getSpeedByACCKey,
} = require('./loadCfgFile');

class ConfigFile {
  constructor(aid) {
    this.type = 0;    //0自定义
    this.aid = aid;   //所属电器id，对无线命令码的生成有作用

    this.cmds = [];
    this.map = [];
    this.map2 = [];

    this.applianceType = '';
    this.manufact = '';
    this.model = '';
  }

  async loadFile(fileName) {
    const fileBuffer = await new Promise((resolve, reject) => {
      fs.readFile(__dirname + '/airConditioning.cfg', (err, buf) => {
        if (err) {
          console.log('read file ERROR!');
          reject(err);
        }
        resolve(buf);
      });
    });

    const fileInfo = readFile(fileBuffer);
    this.type = fileInfo.ekind;
    this.applianceType = fileInfo.etype;
    this.manufact = fileInfo.Manufacturer;
    this.model = fileInfo.model;

    //获得循环次数
    const loopct = (fileInfo.ekind === T_AC) ? fileInfo.indexAreaSize : fileInfo.cmdNum;
    const loaded = 0;

    for (let i = 0; i < loopct; i++) {
      const cmdInfo = readCommand(fileBuffer, fileInfo, i);
      //不允许length越界的情况
      if (cmdInfo !== 'object') {
        if (fileInfo.eKind !== T_AC)
          console.log("cmd NO.%d error = %d,lenth=%d, filesize =%d, cmdoff=%d", i, cmdInfo, cmdInfo.length, fileInfo.cmdSize, cmdInfo.offset);
        else
          console.log("AC cmd %d error = %d,clenth=%d, cmdSize =%d, cmdoff=%d", i, cmdInfo, cmdInfo.length, fileInfo.cmdSize, cmdInfo.offset);
      }
      if (cmdInfo.length > fileInfo.cmdSize - fileInfo.cmdHeadSize)
        cmdInfo.length = fileInfo.cmdSize - fileInfo.cmdHeadSize;

      const tmp = new Array(160);//自动生成配码命令（根据保存的命令名字）
      let rf = 1;//是否重新创建命令，0表示直接读取文件中的命令码
      if ((fileInfo.eKind & MASK_MASK) === MASK_2262) {// 生成12个2bit，存到12字节中，文件内容无意义
        cmdInfo.length = 12;
        const rfcode = (this.aid & 0xfffff);//取20bit
        for (let j = 0; j < 10; j++)
          tmp[j] = (rfcode & (0x03 << j)) >> j;
        tmp[10] = i % 3;//0,1,2
        tmp[11] = i / 3;//0,1,2
      } else if ((fileInfo.eKind & MASK_MASK) === MASK_1527) {// 生成24个1bit，存到24字节中，文件内容无意义
        cmdInfo.length = 24;
        const rfcode = (this.aid & 0x1fffff) | ((i + 1) << 21);//取21bit,i的3bit最多8个命令
        for (let j = 0; j < 24; j++)
          tmp[j] = (rfcode & (1 << j)) >> j;
      } else if ((fileInfo.eKind & MASK_MASK) === MASK_WAVEKC) {//根据aid和命令的keycode决定如何生成命令，文件内容无意义
        //前4个字节在文件中应该也有，可以读4个字节，也可以根据key重新生成。
        cmdInfo.length = 4;//MASK_TWAVE命令前四个字节为发送方式
        CmdKeyCode * kc = (CmdKeyCode *)( & cinfo.key
      )
        ;
        tmp[0] = kc->count;//发几轮，默认1
        tmp[1] = kc->intval;//时间长度单位，默认20us。
        tmp[2] = 0;
        tmp[3] = 0;//保留，对齐。

        //根据厂家开始生成波形，模块直接发送。
        if (kc->type === CMD_KEYCODE_BOFU)
          cmdInfo.length = buildBOFU(tmp, this.aid, i);

        //不支持的直接返回4，模块不会处理，app可以提示不支持
      } else if ((fileInfo.eKind & MASK_MASK) === MASK_STATE) {//状态命令
        cmdInfo.length = 4;//取得key即可，无需读取文件
        tmp[0] = cmdInfo.key;//状态码，发给设备
        tmp[1] = 0;
        tmp[2] = 0;
        tmp[3] = 0;//保留，对齐。

        rf = 0;//还是读文件吧，将忽略上面的tmp
      } else if ((fileInfo.eKind & MASK_MASK) === MASK_WAVE) {//通用波形（备用），正常读取文件，直接TWAVE发送
        rf = 0;//命令已经是TWAVE，无须再转
      } else//红外调制波形MASK_IR，正常读取文件
        rf = 0;
    }


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
}

module.exports = ConfigFile;