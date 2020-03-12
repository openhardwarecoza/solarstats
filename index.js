const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

const port = new SerialPort('/dev/ttyUSB0', {
  baudRate: 2400,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
})

const parser = port.pipe(new Readline({
  delimiter: '\r'
}))
parser.on('data', function(data) {
  console.log("received: ", data)
})

// port.on('data', function(data) {
//   console.log('Data: ' + data);
// });


setInterval(function() {
  var command = "QPIGS"
  var crc = compute(command)
  var hexToSend = toHex(command) + crc + "0d"
  var toSend = Buffer.from(hexToSend, 'hex');
  console.log("sending: ", toSend)
  port.write(toSend)
}, 1000);


console.log(compute("QPIGS"))



function compute(data) {
  // computes crc value

  var i;
  var j;
  var k;
  var bit;
  var datalen;
  var len;
  var actchar;
  var flag;
  var counter;
  var c;
  var crc = new Array(8 + 1);
  var mask = new Array(8);
  var hexnum = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");

  var data;
  var order;
  var polynom = new Array(8);
  var init = new Array(8);
  var xor = new Array(8);


  // check if all entries are present

  var crcorder = "16";
  var crcpolynom = "1021";
  var crcinit = "0"
  var crcxor = "0"
  var printResult = ""

  if (crcorder == "" || crcpolynom == "" || crcinit == "" || crcxor == "") {
    printResult = "Invalid parameters";
    console.log(printResult)
    // console.log(crcorder)
    // console.log(crcpolynom);
    // console.log(crcinit);
    // console.log(crcxor);
    // return;
  }


  // convert crc order

  order = parseInt(crcorder, 10);
  if (isNaN(order) == true || order < 1 || order > 64) {
    printResult = "CRC order must be between 1 and 64";
    console.log(printResult)
    return;
  }


  // convert crc polynom

  polynom = convertentry(crcpolynom, order);
  if (polynom[0] < 0) {
    printResult = "Invalid CRC polynom";
    console.log(printResult)
    return;
  }


  // convert crc init value

  init = convertentry(crcinit, order);
  if (init[0] < 0) {
    printResult = "Invalid initial value";
    return;
  }


  // convert crc xor value

  xor = convertentry(crcxor, order);
  if (xor[0] < 0) {
    printResult = "Invalid XOR value";
    console.log(printResult)
    return;
  }

  // generate bit mask

  counter = order;
  for (i = 7; i >= 0; i--) {
    if (counter >= 8) mask[i] = 255;
    else mask[i] = (1 << counter) - 1;
    counter -= 8;
    if (counter < 0) counter = 0;
  }

  crc = init;

  //  data = unescape(document.crcform.data.value);
  // data = "QPIGS";
  datalen = data.length;
  len = 0; // number of data bytes

  crc[8] = 0;


  // main loop, algorithm is fast bit by bit type

  for (i = 0; i < datalen; i++) {
    c = data.charCodeAt(i);
    if (data.charAt(i) == '%') // unescape byte by byte (%00 allowed)
    {
      if (i > datalen - 3) {
        printResult = "Invalid data sequence";
        console.log(printResult)
        return;
      }
      ch = parseInt(data.charAt(++i), 16);
      if (isNaN(ch) == true) {
        printResult = "Invalid data sequence";
        console.log(printResult)
        return;
      }
      c = parseInt(data.charAt(++i), 16);
      if (isNaN(c) == true) {
        printResult = "Invalid data sequence";
        console.log(printResult)
        return;
      }
      c = (c & 15) | ((ch & 15) << 4);
    }



    // rotate one data byte including crcmask

    for (j = 0; j < 8; j++) {
      bit = 0;
      if (crc[7 - ((order - 1) >> 3)] & (1 << ((order - 1) & 7))) bit = 1;
      if (c & 0x80) bit ^= 1;
      c <<= 1;
      for (k = 0; k < 8; k++) // rotate all (max.8) crc bytes
      {
        crc[k] = ((crc[k] << 1) | (crc[k + 1] >> 7)) & mask[k];
        if (bit) crc[k] ^= polynom[k];
      }
    }
    len++;
  }


  // perform xor value
  for (i = 0; i < 8; i++) crc[i] ^= xor[i];

  // write result
  printResult = "";
  var hexData = ""
  flag = 0;
  for (i = 0; i < 8; i++) {
    actchar = crc[i] >> 4;
    if (flag || actchar) {
      printResult += hexnum[actchar];
      hexData += hexnum[actchar];
      flag = 1;
    }

    actchar = crc[i] & 15;
    if (flag || actchar || i == 7) {
      printResult += hexnum[actchar];
      hexData += hexnum[actchar];
      flag = 1;
    }
  }

  var hexData = printResult

  printResult += " (hex), " + len + " data byte";
  if (len != 1) printResult += "s";

  // console.log(printResult)
  // setfocus(document.crcform.data);
  return (hexData);
}

function convertentry(input, order) {
  // convert from ascii to hexadecimal value (stored as byte sequence)

  var len;
  var actchar;
  var polynom = new Array(0, 0, 0, 0, 0, 0, 0, 0);
  var brk = new Array(-1, 0, 0, 0, 0, 0, 0, 0);

  // convert crc value into byte sequence

  len = input.length;


  for (i = 0; i < len; i++) {
    actchar = parseInt(input.charAt(i), 16);
    if (isNaN(actchar) == true) return (brk);
    actchar &= 15;

    for (j = 0; j < 7; j++) polynom[j] = ((polynom[j] << 4) | (polynom[j + 1] >> 4)) & 255;
    polynom[7] = ((polynom[7] << 4) | actchar) & 255;
  }


  // compute and check crc order

  count = 64;
  for (i = 0; i < 8; i++) {
    for (j = 0x80; j; j >>= 1) {
      if (polynom[i] & j) break;
      count--;
    }
    if (polynom[i] & j) break;
  }

  if (count > order) return (brk);

  return (polynom);
}

function toHex(str) {
  var hex;
  try {
    hex = unescape(encodeURIComponent(str))
      .split('').map(function(v) {
        return v.charCodeAt(0).toString(16)
      }).join('')
  } catch (e) {
    hex = str
    console.log('invalid text input: ' + str)
  }
  return hex
}

function hex2a(hexx) {
  var hex = hexx.toString(); //force conversion
  var str = '';
  for (var i = 0;
    (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}
hex2a('32343630'); // returns '2460'