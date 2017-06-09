const rp = require('request-promise');

const options = {
  method: 'POST',
  uri: 'http://localhost:3000/api/test',
  body: {
    id:1,
    name:'lwf',
    date: '2017'
  },
  json: true // Automatically stringifies the body to JSON
};

rp(options)
    .then(function (parsedBody) {
      // POST succeeded...
      console.log('sucessfully!');
      console.log(parsedBody);
    })
    .catch(function (err) {
      // POST failed...
      console.log(err);
    });