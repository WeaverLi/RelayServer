class DeviceObjCache {
  constructor(redisClient) {
   this.redisClient=redisClient;
  }

  add({tcpClient, token, netID, devID}) {

  }

  del({devID}) {

  }

  find(devID) {

  }

}

module.exports=DeviceObjCache;