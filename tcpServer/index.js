const net = require('net');
const server = net.createServer();

const messageHandle = require('./messageHandle');

// 监听新的设备连接
server.on('connection', client => {
  console.log('Client connection');
  console.log(' local = %s:%s', client.localAddress, client.localPort);
  console.log(' remote = %s:%s', client.remoteAddress, client.remotePort);

  // 心跳定时20s
  // client.setTimeout(20000);
  // 接收数据的编码
  // client.setEncoding('hex');

  // 监听来自设备的数据，数据(receivedBuffer)为Buffer对象
  // client.on('data', receivedBuffer => {
  //   console.log('Received data from client on port %d:', client.remotePort, receivedBuffer);
  //   console.log('Bytes received: ', client.bytesRead);
  //   server.getConnections((err, count) => console.log('Remaining Connections: ' + count));
  //
  //   // writeData(client, sendData);
  //   // console.log('Bytes sent: ', client.bytesWritten);
  //   // client.end();
  // });

  client.on('data', messageBuffer => {
    messageHandle(client, messageBuffer);
  });

  client.on('end', () => {
    console.log(`Client ${client.remoteAddress + ':' + client.remotePort} disconnected`);
    server.getConnections((err, count) => console.log('Remaining Connections: ' + count));
  });

  client.on('error', err => console.log('Socket Error: ', JSON.stringify(err)));

  // 设定的周期内没有接收到心跳时触发
  client.on('timeout', () => {
    console.log('Socket Time Out');
    client.end();
  });
});

// 服务器监听的IP和端口号
server.listen(/*5001, '192.168.0.108',*/3000, 'localhost', () => {
  console.log('Server listening: ', JSON.stringify(server.address()));

  server.on('close', () => console.log('Server Terminated'));

  server.on('error', err => console.log('Server Error: ', JSON.stringify(err)));
});

module.exports = server;