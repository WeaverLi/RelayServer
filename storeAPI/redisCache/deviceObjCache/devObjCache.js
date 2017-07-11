class DeviceObjCache {
  constructor(redisClient) {
    this.redisClient = redisClient;
  }

  async add({tcpClient, token, netID, devID}) {
    return await new Promise((resolve, reject) => {
      this.redisClient.hmset(
          `${netID}-${devID}`,
          {
            tcpClient,
            token
          },
          (err, res) => {
            if (err) reject(err);
            resolve(res);
          });
    });
  }

  async update(id, Obj) {
    return await new Promise((resole, reject) => {
      this.redisClient.hgetall(id, (err, res) => {
        if (err) reject(err);

        this.redisClient.hmset(id, Object.assign(res, Obj), (err, res) => {
          if (err) reject(err);
          resole(res);
        });
      });
    })
  }

  async del(id) {
    return await new Promise((resolve, reject) => {
      this.redisClient.del(`http:${id}`, (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    })
  }
}

module.exports = DeviceObjCache;