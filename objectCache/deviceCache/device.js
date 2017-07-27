class Device {
  constructor({devID, token, devType, channelInfo, devName, serialNo, did, cfgFile, socket, lastSeq}) {
    this.devID = devID;
    this.devName = devName;
    this.serialNo = serialNo;
    this.token = token;
    this.devType = devType;
    this.channelInfo = channelInfo;
    this.did = did;
    this.cfgFile = cfgFile;
    this.socket = socket;
    this.lastSeq = lastSeq;
  }
}

module.exports = Device;