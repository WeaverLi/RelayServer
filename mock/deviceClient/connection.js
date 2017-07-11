const net = require('net');

function getConnection(connName) {
  const client = net.connect({port: 3000, host: 'localhost'}, () => {
    console.log(connName + ' Connected:');
    console.log(' local = %s:%s', client.localAddress, client.localPort);
    console.log(' remote = %s:%s', client.remoteAddress, client.remotePort);

    // client.setTimeout(5000);
    client.setEncoding('hex');

    client.on('data', data => {
      console.log(connName + ' From Server: ' + data.toString());
      // client.end();
    });

    client.on('end', () => console.log(connName + ' Client disconnected'));

    client.on('error', err => console.log('Socket Error: ', JSON.stringify(err)));

    client.on('timeout', () => console.log('Socket Time Out'));

    client.on('close', () => console.log('Socket Closed'));
  });

  return client;
}

module.exports = getConnection;