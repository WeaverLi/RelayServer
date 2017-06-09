function hexToJson(hexData) {

  const preData = preTreatData(hexData);


}

function preTreatData(hexData) {

  const statrt = hexData.slice(0, 2);
  if (statrt !== '7e') throw ("ERROR: start must be '7e' is errror!");

  const type = hexData.slice(2, 4);
  if (type !== '' || '' || '' || '' || '') throw ("ERROR: type must be 'R' or 'r' or 'M' or 'm' or 'f'");

  const Length = hexData.slice(4, 8);

  const token = hexData.slice(8, 16);
  const netID = hexData.slice(16, 24);
  const devID = hexData.slice(24, 32);
  const rest = hexData.slice(32, hexData.length);

  return {
    statrt,
    type,
    Length,
    token,
    netID,
    devID,
    rest
  }
}