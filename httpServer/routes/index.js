const express = require('express');
const router = express.Router();

// const {addHttpReq} = require('../../objectCache/httpCacheAPI');
const query = require('./query');
const control = require('./control');

// 查询
router.post('/api/dev/query', /*addHttpReq,*/ query);

// 控制
router.post('/api/dev/control', /*addHttpReq,*/ control);

module.exports = router;
