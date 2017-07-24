const HttpReqCache = require('./httpReqCache');

module.exports = HttpReqCache;

/** HttpReqCache使用方法
 *  属性：{
 *          redisClient                  // redis数据库客户端连接
 *        }
 *
 *  方法：
 *        add(req, res)                  // 向redis数据库‘0’添加一个HTTP请求对象，会自动为该请求分配一个唯一的id标识
 *        del(id)                        // 删除某一id标识对应的HTTP请求
 *
 * */