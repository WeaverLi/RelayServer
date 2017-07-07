const express = require('express');
const router = express.Router();

const {saveHttpReqToRedis} = require('../../storeAPI/httpReqAPI');
const query = require('./query');
const control = require('./control');

// 查询
router.post('/api/query', saveHttpReqToRedis, query);

// 控制
router.post();
router.post();
