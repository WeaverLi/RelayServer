const uuidv1 = require('uuid/v1');
const saveToRedis = Symbol('saveToRedis');
const delFromRedis = Symbol('delFromRedis');

class HttpBuffer {
  constructor(redisClient) {
    this.redisClient = redisClient;
  }

  add(req, res) {
    const uuid = uuidv1();

    const save = async (uuid, req, res) => {
      return await this[saveToRedis](uuid, req, res);
    };

    save(uuid, req, res).then(id => {
      // console.log(id);
      return id;
    }).catch(err => {
      console.log(err);
      return err;
    });
  }

  del(id) {
    const delKey = async (id) => {
      return await this[delFromRedis](id);
    };

    delKey(id).then(reply => {
      return reply;
    }).catch(err => {
      console.log(err);
      return err;
    });
  }

  [saveToRedis](uuid, req, res) {
    return new Promise((resolve, reject) => {
      this.redisClient.hmset(
          `http:${uuid}`,
          {
            id: uuid,
            req: JSON.stringify(req),
            res: JSON.stringify(res)
          },
          error => {
            if (error) reject(error);
          }
      );

      resolve(uuid);
    });
  }

  [delFromRedis](id) {
    return new Promise((resolve, reject) => {
      this.redisClient.del(`http:${id}`, (err, reply) => {
        if (err) reject(err);

        resolve(reply);
      });
    })
  }
}

module.exports = HttpBuffer;