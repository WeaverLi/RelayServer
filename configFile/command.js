class Command {
  constructor({name, cmd,style,locate}) {
    this.location = locate;
    this.style = style;
    this.name = name;
    this.cmd = cmd;  // []
    this.key = 0;
  }

  getCmds(){
    return this.cmd;
  }

  setCmds(cmd, start, size) {

  }
}

module.exports = Command;