const express = require('express');
const router = express.Router();

const {addHttpReqToRedis} = require('../../storeAPI/httpReqAPI');
const query = require('./query');
const control = require('./control');

// 查询
router.post('/api/query', addHttpReqToRedis, query);

// 控制
router.post('/api/control',addHttpReqToRedis,control);
