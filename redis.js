const redis = require("redis");

const client = redis.createClient({
  host: 'localhost',
  port: 6379
});

// redis 链接错误
client.on('error', err => console.log(err));

const httpResponseHandle = (res) => {
  client.select('0', err => {
    if (err) throw err;

    client.set();
    client.get();
  });
};

class HttpHandle {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

}

module.exports = HttpHandle;



