const Message = require('../../../message');

const query = (req, res) => {
  const {token, netID, devID, chnlType, chnlNumber, chnlParam} = req.query;

  const queryMessage = new Message({type: 'H', token, netID, devID});
  queryMessage.addBody({chnlType, chnlNumber, chnlParam});
  const msgBuffer = queryMessage.encode();



};

module.exports = query;