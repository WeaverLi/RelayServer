const rp = require('request-promise');

const options1 = {
  method: 'POST',
  uri: 'http://localhost:5000/api/dev/control',
  body: {
    appkey: '127.0.0.1:5000',
    did: 1,
    seq: 123
  },
  json: true // Automatically stringifies the body to JSON
};


rp(options1)
    .then(function (parsedBody) {
      // POST succeeded...
      console.log('sucessfully!');
      console.log(parsedBody);
    })
    .catch(function (err) {
      // POST failed...
      console.log(err);
    });
