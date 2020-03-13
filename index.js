process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
var express = require("express");
var app = express();
var http = require("http").Server(app);
var ioServer = require('socket.io');
var io = new ioServer();
var ip = require("ip");
var fs = require('fs');
var path = require("path");



const httpserver = http.listen(8080, '0.0.0.0', function() {
  console.log('http:  listening on:' + ip.address() + ":" + 8080);
});

io.attach(httpserver);
app.use(express.static(path.join(__dirname, "app")));

// app.get('/', function(req, res) {
//   console.log(req)
//   res.sendFile(__dirname + '/index.html');
// });

io.on('connection', function(socket) {
  socket.emit('welcome', inverterData);
  socket.on('my other event', function(data) {
    console.log(data);
  });
});

var sentBuffer = [];

var inverterData = {
  grid: {
    voltage: 0,
    freq: 0
  },
  inverter: {
    voltage: 0,
    freq: 0,
    apparentpwr: 0,
    activepower: 0,
    loadpercent: 0,
    busvolts: 0,
    heatsinktemp: 0
  },
  battery: {
    voltage: 0,
    sccvoltage: 0,
    chargingcurrent: 0,
    dischargecurrent: 0,
    capacity: 0,
    chargemode: {
      scc: false,
      ac: false
    }
  },
  pv: {
    voltage: 0,
    current: 0
  },
  system: {
    mode: "Off",
    faults: {
      inverter: false,
      busOver: false,
      busUnder: false,
      busSoft: false,
      lineFail: false,
      opvShort: false,
      invVoltLow: false,
      invVoltHigh: false,
      overTemp: false,
      fanLocked: false,
      batVoltHigh: false,
      batVoltLow: false,
      batUnderShutdown: false,
      overload: false,
      eepromFault: false,
      invOverCurrent: false,
      invSoftFail: false,
      invSelfTest: false,
      invOPDCvoltOver: false,
      invBatOpen: false,
      invCurSensorFail: false,
      invBatShort: false,
      invPowerLimiting: false,
      pvVoltHigh: false,
      mpptOverloadFault: false,
      mpptOverloadWarn: false,
      batTooLowtoCharge: false
    }
  }
}


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
  command = sentBuffer.shift();
  console.log("-------------------")
  console.log("Command: ", command)
  console.log("received: ", data)
  if (command == "QPIGS") {
    var generalstatus = data.toString().replace(/[^\w.]+/g, " ").split(" ");
    console.log(JSON.stringify(generalstatus))
    console.log("Grid Voltage: ", generalstatus[1]);
    inverterData.grid.voltage = parseFloat(generalstatus[1])
    console.log("Grid frequency: ", generalstatus[2]);
    inverterData.grid.freq = parseFloat(generalstatus[2])
    console.log("AC output voltage : ", generalstatus[3]);
    inverterData.inverter.voltage = parseFloat(generalstatus[3])
    console.log("AC output frequency: ", generalstatus[4]);
    inverterData.inverter.freq = parseFloat(generalstatus[4])
    console.log("AC output apparent power: ", generalstatus[5]);
    inverterData.inverter.apparentpwr = parseFloat(generalstatus[5])
    console.log("AC output active power: ", generalstatus[6]);
    inverterData.inverter.activepower = parseFloat(generalstatus[6])
    console.log("Output load percent : ", generalstatus[7]);
    inverterData.inverter.loadpercent = parseFloat(generalstatus[7])
    console.log("BUS voltage: ", generalstatus[8]);
    inverterData.inverter.busvolts = parseFloat(generalstatus[8])
    console.log("Battery voltage: ", generalstatus[9]);
    inverterData.battery.voltage = parseFloat(generalstatus[9])
    console.log("Battery charging current: ", generalstatus[10]);
    inverterData.battery.chargingcurrent = parseFloat(generalstatus[10])
    console.log("Battery discharge current: ", generalstatus[16]);
    inverterData.battery.dischargecurrent = parseFloat(generalstatus[16])
    console.log("Battery capacity: ", generalstatus[11]);
    inverterData.battery.capacity = parseFloat(generalstatus[11])
    console.log("Inverter heat sink temperature: ", generalstatus[12]);
    inverterData.inverter.heatsinktemp = parseFloat(generalstatus[12])
    console.log("PV Input current for battery. : ", generalstatus[13]);
    inverterData.pv.current = parseFloat(generalstatus[13])
    console.log("PV Input voltage 1: ", generalstatus[14]);
    inverterData.pv.voltage = parseFloat(generalstatus[14])
    console.log("Battery voltage from SCC : ", generalstatus[15]);
    inverterData.battery.sccvoltage = parseFloat(generalstatus[15])
    console.log("Device status: ", generalstatus[17]);
    var statusstring = generalstatus[17].split("")
    console.log(JSON.stringify(statusstring));
    if (statusstring[0] == 0) {
      console.log("    add SBU priority version: no")
    } else if (statusstring[1] == 1) {
      console.log("    add SBU priority version: yes")
    }

    if (statusstring[1] == 0) {
      console.log("    configuration status unchanged")
    } else if (statusstring[1] == 1) {
      console.log("    configuration status changed")
    }

    if (statusstring[2] == 1) {
      console.log("    SCC firmware version Updated")
    } else if (statusstring[2] == 0) {
      console.log("    SCC firmware version unchanged")
    }
    if (statusstring[3] == 0) {
      console.log("    Load Off")
    } else if (statusstring[3] == 0) {
      console.log("    Load On")
    }
    if (statusstring[4] == 1) {
      console.log("    Float Charge", statusstring[4])
    } else if (statusstring[4] == 0) {
      console.log("    Float Charge", statusstring[4])
    }

    if (statusstring[5] + statusstring[6] + statusstring[7] == "000") {
      console.log("    Charge: none")
      inverterData.battery.chargemode.scc = false;
      inverterData.battery.chargemode.ac = false;
    }
    if (statusstring[5] + statusstring[6] + statusstring[7] == "110") {
      console.log("    Charge: scc")
      inverterData.battery.chargemode.scc = true;
      inverterData.battery.chargemode.ac = false;
    }
    if (statusstring[5] + statusstring[6] + statusstring[7] == "101") {
      console.log("    Charge: ac")
      inverterData.battery.chargemode.scc = false;
      inverterData.battery.chargemode.ac = true;
    }
    if (statusstring[5] + statusstring[6] + statusstring[7] == "111") {
      console.log("    Charge: scc and ac")
      inverterData.battery.chargemode.scc = true;
      inverterData.battery.chargemode.ac = true;
    }

  } else if (command == "QMOD") {
    var devicemode = data.toString().replace(/[^\w.]+/g, " ").split(" ");
    var mode = ""
    if (devicemode[1] == "P") {
      mode += "Power On Mode"
      inverterData.system.mode = "Power On Mode"
    }
    if (devicemode[1] == "S") {
      mode += "Standby Mode"
      inverterData.system.mode = "Standby Mode"
    }
    if (devicemode[1] == "L") {
      mode += "Line Mode"
      inverterData.system.mode = "Line Mode"
    }
    if (devicemode[1] == "B") {
      mode += "Battery Mode"
      inverterData.system.mode = "Battery Mode"
    }
    if (devicemode[1] == "F") {
      mode += "Fault Mode"
      inverterData.system.mode = "Fault Mode"
    }
    if (devicemode[1] == "H") {
      mode += "Power Saving Mode"
      inverterData.system.mode = "Power Saving Mode"
    }
    console.log("Device Mode: ", mode)
  } else if (command == "QPIRI") {
    var rating = data.toString().replace(/[^\w.]+/g, " ").split(" ");
    console.log(rating)
    console.log("Grid rating voltage : ", rating[1]);
    console.log("Grid rating current : ", rating[2]);
    console.log("AC output rating voltage : ", rating[3]);
    console.log("AC output rating frequency : ", rating[4]);
    console.log("AC output rating current : ", rating[5]);
    console.log("AC output rating apparent power: ", rating[6]);
    console.log("AC output rating active power : ", rating[7]);
    console.log("Battery rating voltage : ", rating[8]);
    console.log("Battery re-charge voltage : ", rating[9]);
    console.log("Battery under voltage: ", rating[10]);
    console.log("Battery bulk voltage: ", rating[11]);
    console.log("Battery float voltage : ", rating[12]);
    console.log("Battery type : ", rating[13]);
    console.log("Current max AC charging current: ", rating[14]);
    console.log("Current max charging current: ", rating[15]);
    console.log("Input voltage range: ", rating[16]);
    console.log("Output source priority: ", rating[17]);
    console.log("Charger source priority : ", rating[18]);
    console.log("Parallel max num: ", rating[19]);
    console.log("Machine type : ", rating[20]);
    console.log("Topology: ", rating[21]);
    console.log("Output mode: ", rating[22]);
    console.log("Battery re-discharge voltage : ", rating[23]);
    console.log("PV OK condition for parallel: ", rating[24]);
    console.log("PV power balance: ", rating[25]);
    console.log(": ", rating[26]);
    console.log(": ", rating[27]);
  } else if (command == "QPIWS") {
    var warnings = data.toString().replace(/[^\w.]+/g, " ").split(" ")[1].split("");
    console.log("Faults:")

    for (var fault in inverterData.system.faults) {
      // skip loop if the property is from prototype
      if (!inverterData.system.faults.hasOwnProperty(fault)) continue;

      // reset status so we can set it from data
      inverterData.system.faults[fault] = false;
    }

    if (warnings[1] == 1) {
      console.log("Inverter Fault")
      inverterData.system.faults.inverter = true
    }
    if (warnings[2] == 1) {
      console.log("Bus Over Fault")
      inverterData.system.faults.busOver = true
    }
    if (warnings[3] == 1) {
      console.log("Bus Under Fault")
      inverterData.system.faults.busUnder = true
    }
    if (warnings[4] == 1) {
      console.log("Bus Soft Fault")
      inverterData.system.faults.busSoft = true
    }
    if (warnings[5] == 1) {
      console.log("Line Fail Fault")
      inverterData.system.faults.lineFail = true
    }
    if (warnings[6] == 1) {
      console.log("OPV Short Fault")
      inverterData.system.faults.opvShort = true
    }
    if (warnings[7] == 1) {
      console.log("Inverter Voltage Low Fault")
      inverterData.system.faults.invVoltLow = true
    }
    if (warnings[8] == 1) {
      console.log("Inverter Voltage High Fault")
      inverterData.system.faults.invVoltHigh = true
    }
    if (warnings[9] == 1) {
      console.log("Over Temp Fault")
      inverterData.system.faults.overTemp = true
    }
    if (warnings[10] == 1) {
      console.log("Fan Locked Fault")
      inverterData.system.faults.fanLocked = true
    }
    if (warnings[11] == 1) {
      console.log("Battery Voltage High Fault")
      inverterData.system.faults.batVoltHigh = true
    }
    if (warnings[12] == 1) {
      console.log("Battery Voltage Low Fault")
      inverterData.system.faults.batVoltLow = true
    }
    if (warnings[13] == 1) {
      console.log("reserved Fault")
      // inverterData.system.faults.xxx = true
    }
    if (warnings[14] == 1) {
      console.log("Battery Under Shutdown Faultt")
      inverterData.system.faults.batUnderShutdown = true
    }
    if (warnings[15] == 1) {
      console.log("reserved Fault")
      // inverterData.system.faults.xxx = true
    }
    if (warnings[16] == 1) {
      console.log("Overload Fault")
      inverterData.system.faults.overload = true
    }
    if (warnings[17] == 1) {
      console.log("EEPROM Fault")
      inverterData.system.faults.eepromFault = true
    }
    if (warnings[18] == 1) {
      console.log("Inverter Over Current Fault")
      inverterData.system.faults.invOverCurrent = true
    }
    if (warnings[19] == 1) {
      console.log("Inverter Soft Fail Fault")
      inverterData.system.faults.invSoftFail = true
    }
    if (warnings[20] == 1) {
      console.log("Inverter Self Test Fail Fault")
      inverterData.system.faults.invSelfTest = true
    }
    if (warnings[21] == 1) {
      console.log("Inverter OP DC Voltage Over Fault")
      inverterData.system.faults.invOPDCvoltOver = true
    }
    if (warnings[22] == 1) {
      console.log("Inverter Bat Open Fault")
      inverterData.system.faults.invBatOpen = true
    }
    if (warnings[23] == 1) {
      console.log("Inverter Current Sensor Fault")
      inverterData.system.faults.invCurSensorFail = true
    }
    if (warnings[24] == 1) {
      console.log("Inverter Battery Short Fault")
      inverterData.system.faults.invBatShort = true
    }
    if (warnings[25] == 1) {
      console.log("Inverter Power Limit Warning")
      inverterData.system.faults.invPowerLimiting = true
    }
    if (warnings[26] == 1) {
      console.log("PV Voltage High Warning")
      inverterData.system.faults.pvVoltHigh = true
    }
    if (warnings[27] == 1) {
      console.log("MPPT Overload Fault")
      inverterData.system.faults.mpptOverloadFault = true
    }
    if (warnings[28] == 1) {
      console.log("MPPT Overload Warning")
      inverterData.system.faults.mpptOverloadWarn = true
    }
    if (warnings[29] == 1) {
      console.log("Battery too low to charge Warning")
      inverterData.system.faults.batTooLowtoCharge = true
    }
    if (warnings[30] == 1) {
      console.log("reserved Fault")
      // inverterData.system.faults.xxx = true
    }
    if (warnings[31] == 1) {
      console.log("reserved Fault")
      // inverterData.system.faults.xxx = true
    }


  }
})


var commandOrder = 0;
//"QMOD" // Device Mode inquiry
//"QPIGS" // Device general status parameters inquiry
//"QPIRI" // Device Rating Information inquiry
//"QPIWS" // Device Warning Status inquiry
var commandsToRun = ["QMOD", "QPIGS", "QPIRI", "QPIWS"]
setInterval(function() {

  command = commandsToRun[commandOrder]
  sentBuffer.push(command)
  var crc = compute(command)
  var hexToSend = toHex(command) + crc + "0d"
  var toSend = Buffer.from(hexToSend, 'hex');
  console.log("sending: ", toSend)
  port.write(toSend)

  if (commandOrder == commandsToRun.length - 1) {
    commandOrder = 0
  } else {
    commandOrder++
  }

  io.sockets.emit('inverterData', inverterData);

}, 1000);



// Axpert / EASUN / Inverter CRC Calculation:
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