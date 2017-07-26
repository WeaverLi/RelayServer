const ConfigFile = require('./configFile');

module.exports = ConfigFile;

/**  ConfigFile类使用方法
 *      属性：{
 *              aid,                      // 所属电器id，对无线命令码的生成(buildBOFU)有作用
 *              type,                     // 命令类型(高三位)，面板类型(低三位)
 *              applianceType,            // 电器类型名，汉字，16字节
 *              manufact,                 // 电器厂家，汉子，16字节
 *              model,                    // 电器型号，汉子，32字节
 *              cmds,                     // 电器的命令<Command>
 *              map,                      // 按key存的命令Map结构
 *              map2                      // 按name存的命令Map结构
 *      }
 *
 *      方法：{
 *                  loadFile(fileName)    // 加载命令文件，参数为文件名（文件名必须存在);
 *                  storeFile(fileName)   // 存储命令文件，参数为存储指定的文件名，文件名没有则会被创建
 *                  addCommand(key,cmd)   // 添加命令
 *                  delCommand(cmd)       // 删除命令
 *                  getCommand({key,name})// 查找命令，通过key或name
 *                  setAid(id)
 *                  getType()
 *                  setType(tp)
 *                  getMask()
 *                  setMask(msk)
 *                  getVAT()
 *                  getParam()
 *                  buildACCKey(mode, onoff, temp, speed)
 *                  buildTwaveKey(type, intval, repeat)
 *                  getACCMode(key)
 *                  getACCTemp(key)
 *                  getACCSpeed(key)
 *      }
 * */