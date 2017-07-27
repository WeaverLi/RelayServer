const express = require('express');
const router = express.Router();

const {addHttpReqToRedis} = require('../../objectCache/httpReq');
const query = require('./query');
const control = require('./control');

// 查询
router.post('/api/dev/query', addHttpReqToRedis, query);

// 控制
router.post('/api/dev/control', addHttpReqToRedis, control);

module.exports = router;
