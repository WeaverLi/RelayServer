function writeData(socket, data) {
  const success = !socket.write(data);

  if (!success) {
    (function (socket, data) {
      socket.once('drain', () => writeData(socket, data));
    })(socket, data);
  }
}

module.exports = writeData;