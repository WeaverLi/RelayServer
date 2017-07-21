class Command {
  constructor({name, cmd, style, locale, key}) {
    this.location = locale;
    this.style = style;
    this.name = name;   // ''
    this.cmd = cmd;  // []
    this.key = key;
  }

  getCmds() {
    return this.cmd;
  }

  setCmds(cmd, start, size) {

  }
}

module.exports = Command;