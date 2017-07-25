function sendDataToDevice(socket, data) {
  const success = !socket.write(data);
  if (!success) {
    (function (socket, data) {
      socket.once('drain', function () {
        sendDataToDevice(socket, data);
      });
    })(socket, data);
  }
}

module.exports = sendDataToDevice;