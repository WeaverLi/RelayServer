const express = require('express');
const router = express.Router();

router.post('/api/test', function (req, res) {
  console.log(req.body);
  res.json({err: null, data: null});
});

module.exports = router;