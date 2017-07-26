const errorHandle = ({type, message}) => {
  switch (type) {
    case 1:
      console.log(message);
      break;
    case 2:
      break;
  }
};

module.exports = errorHandle;