class HttpReqCache {
  constructor(redisClient) {
    this.redisClient = redisClient;
  }

  add(id, {req, res}) {

    this.redisClient.hmset(
        `http:${id}`,
        {
          req: JSON.stringify(req),
          res: JSON.stringify(res)
        },
        (err, res) => {
          if (err) return err;
          return res;
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