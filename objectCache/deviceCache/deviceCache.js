class DeviceCache {
  constructor() {
    this.devices = [];
  }

  add(device) {
    if (device.devID) {
      this.devices.push(device);
      return device;
    } else {
      return -1;
    }
  }

  find({devID = null, devName = null, serialNo = null, did = null}) {
    let flag = false;
    if (devID) {
      for (const device of this.devices) {
        if (device.devID === devID) {
          flag = true;
          return device;
        }
      }
      if (flag === false) {
        return -2;   // 找不到设备
      }
    } else if (devName) {
      for (const device of this.devices) {
        if (device.devName === devName) {
          flag = true;
          return device;
        }
      }
      if (flag === false) {
        return -2;   // 找不到设备
      }
    } else if (serialNo) {
      for (const device of this.devices) {
        if (device.serialNo === serialNo) {
          flag = true;
          return device;
        }
      }
      if (flag === false) {
        return -2;   // 找不到设备
      }
    } else if (did) {
      for (const device of this.devices) {
        if (device.did === did) {
          flag = true;
          return device;
        }
      }
      if (flag === false) {
        return -2;   // 找不到设备
      }
    } else {
      return -1; // 查找参数不对
    }
  }

  update({devID = null, devName = null, serialNo = null, did = null}, Obj) {
    let flag = false;
    if (devID) {
      for (const device of this.devices) {
        if (device.devID === devID) {
          flag = true;
          Object.assign(device, Obj);
          return device;
        }
      }
      if (flag === false) {
        return -2;   // 找不到设备
      }
    } else if (devName) {
      for (const device of this.devices) {
        if (device.devName === devName) {
          flag = true;
          Object.assign(device, Obj);
          return device;
        }
      }
      if (flag === false) {
        return -2;   // 找不到设备
      }
    } else if (serialNo) {
      for (const device of this.devices) {
        if (device.serialNo === serialNo) {
          flag = true;
          Object.assign(device, Obj);
          return device;
        }
      }
      if (flag === false) {
        return -2;   // 找不到设备
      }
    } else if (did) {
      for (const device of this.devices) {
        if (device.did === did) {
          flag = true;
          Object.assign(device, Obj);
          return device;
        }
      }
      if (flag === false) {
        return -2;   // 找不到设备
      }
    } else {
      return -1;   // 查找参数错误
    }
  }

  del({devID = null, devName = null, serialNo = null, did = null}) {
    if (devID) {
      const index = this.devices.findIndex(value => value.devID === devID);
      if (index !== -1) {
        this.devices.splice(index, 1);
        return 0;
      } else {
        return -2;   // 找不到设备
      }
    } else if (devName) {
      const index = this.devices.findIndex(value => value.devName === devName);
      if (index !== -1) {
        this.devices.splice(index, 1);
        return 0;
      } else {
        return -2;   // 找不到设备
      }
    } else if (serialNo) {
      const index = this.devices.findIndex(value => value.serialNo === serialNo);
      if (index !== -1) {
        this.devices.splice(index, 1);
        return 0;
      } else {
        return -2;   // 找不到设备
      }
    } else if (did) {
      const index = this.devices.findIndex(value => value.did === did);
      if (index !== -1) {
        this.devices.splice(index, 1);
        return 0;
      } else {
        return -2;   // 找不到设备
      }
    } else {
      return -1; // 查找参数不对
    }
  }
}

module.exports = DeviceCache;