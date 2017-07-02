const uuidv1 = require('uuid/v1');

class HttpBuffer {
  constructor(redisClient) {
    this.redisClient = redisClient;

    this.ids = [];
    this.requests = [];
    this.responses = [];
  }

  add(req, res) {
    this.ids.push(uuidv1());
    this.requests.push(req);
    this.responses.push(res);

    this.redisClient.select('0', err => {
      if (err) throw err;

      this.redisClient.hmset(
          `http${this.ids.length - 1}`,
          ['id', this.ids[this.ids.length - 1],
            'req', this.requests[this.requests.length - 1],
            'res', this.responses[this.responses.length - 1]
          ]
      );
    });
  }

}

module.exports = HttpBuffer;