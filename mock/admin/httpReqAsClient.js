const rp = require('request-promise');

const options1 = {
  method: 'POST',
  uri: 'http://121.40.181.130:5000/api/dev/control',
  body: {
    appkey: '121.40.181.130:5000',
    did: 0,
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
