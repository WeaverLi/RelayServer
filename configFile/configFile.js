const fs = require('fs');
const path = require('path');
const readFile = Symbol('readFile');

class ConfigFile {
  constructor(aid) {
    this.type = 0;    //0自定义
    this.aid = aid;   //所属电器id，对无线命令码的生成有作用

    this.cmds = [];
    this.map = [];
    this.map2 = [];

    this.applianceType = '';
    this.manufact = '';
    this.mode = '';
  }

  async loadFile(fileName) {
    const fd = await new Promise((resolve, reject) => {
      fs.open(__dirname + `../${fileName}`, 'r', (err, fd) => {
        if (err) {
          console.log(err);
          reject(-1);
        }
        resolve(fd);
      });
    });

    if (fd === -1) {
      return -1;
    } else {
      this[readFile](fd,);
    }


  }

  [readFile](fd) {
    fs.read(fd,)
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
}

module.exports = ConfigFile;