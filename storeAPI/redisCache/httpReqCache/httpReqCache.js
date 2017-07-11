const uuidv1 = require('uuid/v1');

class HttpReqCache {
  constructor(redisClient) {
    this.redisClient = redisClient;
  }

  async add({req, res}) {
    const uuid = uuidv1();

    return await new Promise((resolve, reject) => {
      this.redisClient.hmset(
          `http:${uuid}`,
          {
            req: JSON.stringify(req),
            res: JSON.stringify(res)
          },
          (err,res) => {
            if (err) reject(err);
            resolve(uuid);
          }
      );
    });
  }

  async find(id) {
    return await new Promise((resolve,reject)=>{
      this.redisClient.hgetall(`http:${id}`,(err,res)=>{
        if(err) reject(err);
        resolve(res);
      })
    });
  }

  async del(id) {
    return await new Promise((resolve, reject) => {
      this.redisClient.del(`http:${id}`, (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });
  }
}

module.exports = HttpReqCache;