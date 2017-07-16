class DeviceObjCache {
  constructor(redisClient) {
    this.redisClient = redisClient;
  }

  add({tcpClient, token, netID, devID}) {
    this.redisClient.hmset(
        `${netID}-${devID}`,
        {
          tcpClient,
          token
        },
        (err, res) => {
          if (err) return err;
          return res;
        });
  }

  update(id, Obj) {
    this.redisClient.hgetall(id, (err, res) => {
      if (err) return err;

      this.redisClient.hmset(id, Object.assign(res, Obj), (err, res) => {
        if (err) return err;
        return res;
      });
    });
  }

  async find(id) {
    this.redisClient.hgetall(id, (err, res) => {
      if (err) return err;
      return res;
    });
  }

  del(id) {
    this.redisClient.del(`http:${id}`, (err, res) => {
      if (err) return err;
      return res;
    });
  }
}

module.exports = DeviceObjCache;