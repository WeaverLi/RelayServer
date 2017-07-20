class Command {
  constructor({name, cmd, style, locale}) {
    this.location = locale;
    this.style = style;
    this.name = name;   // Uint8Array(20)
    this.cmd = cmd;  // []
    this.key = 0;
  }

  getCmds() {
    return this.cmd;
  }

  setCmds(cmd, start, size) {

  }
}

module.exports = Command;