const getConnection = require('./connection');
const writeData = require('../../util');

/* 建立客户端与服务器的连接 */
const coon1 = getConnection('coon1');
const coon2 = getConnection('coon2');
const coon3 = getConnection('coon3');

/* 客户端向服务器发数据 */
writeData(coon1, 'More Axes');
writeData(coon2, 'More Arrows');
writeData(coon3, 'More Pipe Weed');