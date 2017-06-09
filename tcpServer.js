const net = require('net');

const writeData = require('./util');

const server = net.createServer();

server.on('connection', client => {
  console.log('Client connection');
  console.log(' local = %s:%s', client.localAddress, client.localPort);
  console.log(' remote = %s:%s', client.remoteAddress, client.remotePort);

  client.setTimeout(21000);
  client.setEncoding('hex');
  const sendData = '7e4d00bc 000004d2 00000004 00000004 00000000 00a00100 027f7f7f 0cffa919 be199518 9518bf17 97179518 bf179618 9518bf17 96179618 95189617 96179618 95189617 96179618 9518bf17 bf189617 96179618 95189617 bf179618 bf179617 9618bf17 9617ffff fffffff6 18bf1796 17961796 18bf1796 17961895 18961796 17961895 189617bf 18951896 17961796 18951896 17961796 17961896 17961796 17961896 17961796 179618bf 17ffffff ffffffff ffffffff 10000000';

  client.on('data', data => {
    console.log('Received data from client on port %d:', client.remotePort, data);
    console.log('Bytes received: ', client.bytesRead);
    server.getConnections((err, count) => console.log('Remaining Connections: ' + count));

    // writeData(client, sendData);
    // console.log('Bytes sent: ', client.bytesWritten);
    // client.end();
  });

  client.on('end', () => {
    console.log(`Client ${client.remoteAddress + ':' + client.remotePort} disconnected`);
    server.getConnections((err, count) => console.log('Remaining Connections: ' + count));
  });

  client.on('error', err => console.log('Socket Error: ', JSON.stringify(err)));

  client.on('timeout', () => {
    console.log('Socket Time Out');
    client.end();
  });
});

server.listen(5001, '192.168.0.108', () => {
  console.log('Server listening: ', JSON.stringify(server.address()));

  server.on('close', () => console.log('Server Terminated'));

  server.on('error', err => console.log('Server Error: ', JSON.stringify(err)));
});