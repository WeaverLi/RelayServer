const express = require('express');
const router = express.Router();
const responses = [];

router.post('/api/test1', function (req, res) {
  console.log(req.body);
  // console.log(typeof res);
  // res.json({err: null, data: null});
  responses.push(res);
});

router.post('/api/test2', function (req, res) {
  console.log(req.body);

  responses.push(res);

  responses.forEach(function (rp, index) {
    rp.json({err: null, index: index});
  });
});

module.exports = router;