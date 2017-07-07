const rp = require('request-promise');

const options1 = {
  method: 'POST',
  uri: 'http://localhost:3000/api/test1',
  body: {
    id: 1,
    name: 'lwf',
    date: '2017'
  },
  json: true // Automatically stringifies the body to JSON
};

const options2 = {
  method: 'POST',
  uri: 'http://localhost:3000/api/test2',
  body: {
    id: 2,
    name: 'lwf',
    date: '2017'
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

rp(options2)
    .then(function (parsedBody) {
      // POST succeeded...
      console.log('sucessfully!');
      console.log(parsedBody);
    })
    .catch(function (err) {
      // POST failed...
      console.log(err);
    });