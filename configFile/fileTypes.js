const FileInfo = {
  //@ 0byte
  version,                 //版本，1字节
  ekind,                   //格式的命令类型和面板类型，1字节见EKIND结构
  indexOffset,             //索引区偏移，2字节，固定填76：0x4c00
  cmdOffset,               //命令区偏移，2字节，一般82（FileInfo＋）：0x5200
  headCRC,                     //头部CRC校验，2字节，暂时填固定值 0x5555
  //@ 8byte
  etype: [],               //电器类型，16字节，UTF-8编码，4汉字
  Manufacturer: [],        //厂家，16字节，UTF-8编码，4汉字
  model: [],               //电器型号，32字节
                           //@ 72byte
  panelHeight,             //面板区高度，2字节
  panelWidth,              //面板区宽度，2字节
                           //@ 76byte 命令索引表头
  cmdNum,                  //对于空调要重新统计，其他的直接读取,这个是算出来的不需要写在文件里面
  indexAreaSize,           //索引表的单位个数，512或0：0x0002
  idxSize,                 //索引表项大小，2或0
  cmdHeadSize,             //命令头大小，2或32： 0x20
                           //@ 80byte
  cmdSize,                 //命令项大小（一般为160+32:0xc000，空调为160+2:0xa200， 对于要生成码的也用192），每个命令项大小相同，用于连续计算命令码的偏移，码实际长度可以不同。
  fileSize                 //这个也是算出来的，不用写在文件里面
                           // @ 82byte
};

const CmdInfo = {
  length: 0,
  key: 0,                         //空调IR的key；TWAVE用来存重复次数和T单位(us)，见CmdKeyCode结构；
  offset: 0,                      //文件中的偏移
  name: [],
  locale: 0,
  style: 0
};

const CmdKeyCode = {
  type,
  count,
  intval
};

const EKIND = {
  mask,                 // 高3位表示命令类型，000红外学习，001：时间波形，010：1527配码，011:2262配码，
  type                  //低5位表示面板类型,00000：自定义
};

const T_NORMAL = 0;    // 自定义面板的电器
const T_AC = 1;        // 空调

const CMD_KEYCODE_BOFU = 0;   //不同厂家count,intval，波形

const MASK_MASK = 0xe0;   //高三位有效

const MASK_IR = 0x00;     //红外学习的波形命令，可直接发送的38k调制波形
const MASK_WAVEKC = 0x20; //时间波形码的命令0010 0000，需要根据AID、cmd的keycode生成波形
const MASK_2262 = 0x40;   //无线配码命令0100 0000，需要根据AID生成2262码
const MASK_1527 = 0x60;   //无线配码命令 0110 0000，需要根据AID生成1257码
const MASK_WAVE = 0x80;   //时间波形的命令1000 0000，可直接发送的波形，将来用于学习到的任意波形，暂不使用
const MASK_STATE = 0xe0;  //状态文件，保存状态的码字1字节即可


module.exports = {
  FileInfo,
  CmdInfo,
  CmdKeyCode,
  T_AC
};