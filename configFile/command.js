class Command {
  constructor({name, cmd}) {
    this.location = 0x00000000;
    this.style = 0x00000000;
    this.name = name;
    this.cmd = cmd;  // []
    this.key = 0x0000;
  }

  getCmds(){
    return this.cmd;
  }

  setCmds(cmd, start, size) {

  }
}

module.exports = Command;