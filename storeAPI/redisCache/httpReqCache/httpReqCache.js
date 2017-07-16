const uuidv1 = require('uuid/v1');

class HttpReqCache {
  constructor(redisClient) {
    this.redisClient = redisClient;
  }

  add({req, res}) {
    const uuid = uuidv1();

    this.redisClient.hmset(
        `http:${uuid}`,
        {
          req: JSON.stringify(req),
          res: JSON.stringify(res)
        },
        (err, res) => {
          if (err) return err;
          return uuid;
        }
    );
  }

  find(id) {
    this.redisClient.hgetall(`http:${id}`, (err, res) => {
      if (err) return err;
      return res;
    })
  }

  del(id) {
    this.redisClient.del(`http:${id}`, (err, res) => {
      if (err) return err;
      return res;
    });
  }
}

module.exports = HttpReqCache;