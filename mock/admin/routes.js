const express = require('express');
const router = express.Router();
const responses = [];

// router.post('/api/test1', function (req, res) {
//   console.log(req.body);
//   // console.log(typeof res);
//   // res.json({err: null, data: null});
//   responses.push(res);
// });
//
// router.post('/api/test2', function (req, res) {
//   console.log(req.body);
//
//   responses.push(res);
//
//   responses.forEach(function (rp, index) {
//     rp.json({err: null, index: index});
//   });
// });

router.get('/api/dev/verify', (req, res) => {
  const {sn, type} = req.body;
  console.log({sn, type});

  res.json({
    ret: 0,
    reason: 'OK',
    did:0
  });
});

router.get('/api/dev/update', (req, res) => {
  const {state, details} = req.body;
  console.log({state, details});

  res.json({
    ret: 0,
    reason: 'OK'
  })
});

module.exports = router;