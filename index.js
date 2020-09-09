process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
// To see console.log output run with `DEBUGCONTROL=true electron .` or set environment variable for DEBUGCONTROL=true
// debug_log debug overhead
DEBUG = true;
if (process.env.DEBUGCONTROL) {
  DEBUG = true;
  console.log("Console Debugging Enabled")
}

function debug_log() {
  if (DEBUG) {
    console.log.apply(this, arguments);
  }
} // end Debug Logger

process.on("uncaughtException", (err) => {
  debug_log(err)
});

console.log("Starting " + require('./package').name + " version " + require('./package').version)

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
  debug_log('http:  listening on:' + ip.address() + ":" + 8080);
});

io.attach(httpserver);
app.use(express.static(path.join(__dirname, "app")));

io.on('connection', function(socket) {
  socket.emit('welcome', inverterData);
  socket.on('my other event', function(data) {
    debug_log(data);
  });
});

var mqtt = require('mqtt')
options = {
  clientId: "inverter-bridge",
  username: "mqtt",
  password: "7szlyq",
  clean: true
};

var client = mqtt.connect('mqtt://192.168.0.245:1883', options)

var initConfig = [
  ["Inverter_mode", "", "solar-power"], //#1 = Power_On, 2 = Standby, 3 = Line, 4 = Battery, 5 = Fault, 6 = Power_Saving, 7 = Unknown["AC_grid_voltage", "V", "power-plug"],
  ["AC_grid_voltage", "V", "power-plug"],
  ["AC_grid_frequency", "Hz", "current-ac"],
  ["AC_out_voltage", "V", "power-plug"],
  ["AC_out_frequency", "Hz", "current-ac"],
  ["PV_in_voltage", "V", "solar-panel-large"],
  ["PV_in_current", "A", "solar-panel-large"],
  ["PV_in_watts", "W", "solar-panel-large"],
  ["PV_in_watthour", "Wh", "solar-panel-large"],
  ["SCC_voltage", "V", "current-dc"],
  ["Load_pct", "%", "brightness-percent"],
  ["Load_watt", "W", "chart-bell-curve"],
  ["Load_watthour", "Wh", "chart-bell-curve"],
  ["Load_va", "VA", "chart-bell-curve"],
  ["Bus_voltage", "V", "details"],
  ["Heatsink_temperature", "", "details"],
  ["Battery_capacity", "%", "battery-outline"],
  ["Battery_voltage", "V", "battery-outline"],
  ["Battery_charge_current", "A", "current-dc"],
  ["Battery_discharge_current", "A", "current-dc"],
  ["Load_status_on", "", "power"],
  ["SCC_charge_on", "", "power"],
  ["AC_charge_on", "", "power"],
  ["Battery_recharge_voltage", "V", "current-dc"],
  ["Battery_under_voltage", "V", "current-dc"],
  ["Battery_bulk_voltage", "V", "current-dc"],
  ["Battery_float_voltage", "V", "current-dc"],
  ["Max_grid_charge_current", "A", "current-ac"],
  ["Max_charge_current", "A", "current-ac"],
  ["Out_source_priority", "", "grid"],
  ["Charger_source_priority", "", "solar-power"],
  ["Battery_redischarge_voltage", "V", "battery-negative"]
]

client.on('connect', function() {
  client.subscribe('/homeassistant/sensor/inverter/command', function(err) {
    if (!err) {
      for (i = 0; i > initConfig.length; i++) {
        var string = `{
            \"name\": \"inverter_` + initConfig[i][0] + `\",
            \"unit_of_measurement\": \"` + initConfig[i][1] + `\",
            \"state_topic\": \"homeassistant/sensor/inverter_` + initConfig[i][0] + `\",
            \"icon\": \"mdi:` + initConfig[i][2] + `\",
            \"id\": \"inverter_` + initConfig[i][0] + `\",

        }`
        client.publish("homeassistant/sensor/inverter_" + initConfig[i][0] + "/config", string);
      }

    }
  })
})


client.on('message', function(topic, message) {
  // message is Buffer
  console.log('message')
  console.log(message.toString())
  //client.end()
})

var sentBuffer = [];

var inverterData = {
  grid: {
    voltage: 0,
    freq: 0
  },
  inverter: {
    loadstatus: "",
    invertermode: false,
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
    serialnumber: "",
    protocol: "",
    firmware: {
      qvfw: "",
      qvfw2: ""
    },
    settings: {
      gridVoltRating: 0,
      gridCurrentRating: 0,
      acOutputVoltRating: 0,
      acOutputCFreqRating: 0,
      acOutputCurrentRating: 0,
      acOutputApparentPowerRating: 0,
      acOutputActivePowerRating: 0,
      batteryVoltRating: 0,
      batteryRechargeVoltage: 0,
      batteryUnderVoltage: 0,
      batteryBulkVoltage: 0,
      batteryFloatVoltage: 0,
      batteryReDischargeVoltage: 0,
      batteryType: 0,
      maxACChargingCurrent: 0,
      maxChargingCurrent: 0,
      inputVoltageRange: 0,
      outputSourcePriority: 0,
      chargerSourcePriority: 0,
      parallelMaxNum: 0,
      machineType: 0,
      topology: 0,
      outputMode: 0,
      pvOKparallel: 0,
      pvPowerBalance: 0
    },
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
  if (command == "QPIGS") {
    var generalstatus = data.toString().replace(/[^\w.]+/g, " ").split(" ");
    debug_log(JSON.stringify(generalstatus))
    debug_log("Grid Voltage: ", generalstatus[1]);
    inverterData.grid.voltage = parseFloat(generalstatus[1])
    debug_log("Grid frequency: ", generalstatus[2]);
    inverterData.grid.freq = parseFloat(generalstatus[2])
    debug_log("AC output voltage : ", generalstatus[3]);
    inverterData.inverter.voltage = parseFloat(generalstatus[3])
    debug_log("AC output frequency: ", generalstatus[4]);
    inverterData.inverter.freq = parseFloat(generalstatus[4])
    debug_log("AC output apparent power: ", generalstatus[5]);
    inverterData.inverter.apparentpwr = parseFloat(generalstatus[5])
    debug_log("AC output active power: ", generalstatus[6]);
    inverterData.inverter.activepower = parseFloat(generalstatus[6])
    debug_log("Output load percent : ", generalstatus[7]);
    inverterData.inverter.loadpercent = parseFloat(generalstatus[7])
    debug_log("BUS voltage: ", generalstatus[8]);
    inverterData.inverter.busvolts = parseFloat(generalstatus[8])
    debug_log("Battery voltage: ", generalstatus[9]);
    inverterData.battery.voltage = parseFloat(generalstatus[9])
    debug_log("Battery charging current: ", generalstatus[10]);
    inverterData.battery.chargingcurrent = parseFloat(generalstatus[10])
    debug_log("Battery discharge current: ", generalstatus[16]);
    inverterData.battery.dischargecurrent = parseFloat(generalstatus[16])
    debug_log("Battery capacity: ", generalstatus[11]);
    inverterData.battery.capacity = parseFloat(generalstatus[11])
    debug_log("Inverter heat sink temperature: ", generalstatus[12]);
    inverterData.inverter.heatsinktemp = parseFloat(generalstatus[12])
    debug_log("PV Input current for battery. : ", generalstatus[13]);
    inverterData.pv.current = parseFloat(generalstatus[13])
    debug_log("PV Input voltage 1: ", generalstatus[14]);
    inverterData.pv.voltage = parseFloat(generalstatus[14])
    debug_log("Battery voltage from SCC : ", generalstatus[15]);
    inverterData.battery.sccvoltage = parseFloat(generalstatus[15])
    debug_log("Device status: ", generalstatus[17]);
    var statusstring = generalstatus[17].split("")
    debug_log(JSON.stringify(statusstring));
    if (statusstring[0] == 0) {
      debug_log("    add SBU priority version: no")
    } else if (statusstring[1] == 1) {
      debug_log("    add SBU priority version: yes")
    }

    if (statusstring[1] == 0) {
      debug_log("    configuration status unchanged")
    } else if (statusstring[1] == 1) {
      debug_log("    configuration status changed")
    }

    if (statusstring[2] == 1) {
      debug_log("    SCC firmware version Updated")
    } else if (statusstring[2] == 0) {
      debug_log("    SCC firmware version unchanged")
    }
    if (statusstring[3] == 0) {
      debug_log("    Load Off")
      inverterData.inverter.loadstatus = "Load Off"
    } else if (statusstring[3] == 0) {
      debug_log("    Load On")
      inverterData.inverter.loadstatus = "Load On"
    }
    if (statusstring[4] == 1) {
      debug_log("    Float Charge", statusstring[4])
    } else if (statusstring[4] == 0) {
      debug_log("    Float Charge", statusstring[4])
    }

    if (statusstring[5] + statusstring[6] + statusstring[7] == "000") {
      debug_log("    Charge: none")
      inverterData.battery.chargemode.scc = false;
      inverterData.battery.chargemode.ac = false;
    }
    if (statusstring[5] + statusstring[6] + statusstring[7] == "110") {
      debug_log("    Charge: scc")
      inverterData.battery.chargemode.scc = true;
      inverterData.battery.chargemode.ac = false;
    }
    if (statusstring[5] + statusstring[6] + statusstring[7] == "101") {
      debug_log("    Charge: ac")
      inverterData.battery.chargemode.scc = false;
      inverterData.battery.chargemode.ac = true;
    }
    if (statusstring[5] + statusstring[6] + statusstring[7] == "111") {
      debug_log("    Charge: scc and ac")
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
    debug_log("Device Mode: ", mode)
  } else if (command == "QPIRI") {
    var rating = data.toString().replace(/[^\w.]+/g, " ").split(" ");
    debug_log(rating)
    debug_log("Grid rating voltage : ", rating[1]);
    inverterData.system.settings.gridVoltRating = rating[1]
    debug_log("Grid rating current : ", rating[2]);
    inverterData.system.settings.gridCurrentRating = rating[2]
    debug_log("AC output rating voltage : ", rating[3]);
    inverterData.system.settings.acOutputVoltRating = rating[3]
    debug_log("AC output rating frequency : ", rating[4]);
    inverterData.system.settings.acOutputCFreqRating = rating[4]
    debug_log("AC output rating current : ", rating[5]);
    inverterData.system.settings.acOutputCurrentRating = rating[5]
    debug_log("AC output rating apparent power: ", rating[6]);
    inverterData.system.settings.acOutputApparentPowerRating = rating[6]
    debug_log("AC output rating active power : ", rating[7]);
    inverterData.system.settings.acOutputActivePowerRating = rating[7]
    debug_log("Battery rating voltage : ", rating[8]);
    inverterData.system.settings.batteryVoltRating = rating[8]
    debug_log("Battery re-charge voltage : ", rating[9]);
    inverterData.system.settings.batteryRechargeVoltage = rating[9]
    debug_log("Battery under voltage: ", rating[10]);
    inverterData.system.settings.batteryUnderVoltage = rating[10]
    debug_log("Battery bulk voltage: ", rating[11]);
    inverterData.system.settings.batteryBulkVoltage = rating[11]
    debug_log("Battery float voltage : ", rating[12]);
    inverterData.system.settings.batteryFloatVoltage = rating[12]
    debug_log("Battery type : ", rating[13]);
    inverterData.system.settings.batteryType = rating[13]
    debug_log("Current max AC charging current: ", rating[14]);
    inverterData.system.settings.maxACChargingCurrent = rating[14]
    debug_log("Current max charging current: ", rating[15]);
    inverterData.system.settings.maxChargingCurrent = rating[15]
    debug_log("Input voltage range: ", rating[16]);
    inverterData.system.settings.inputVoltageRange = rating[16]
    debug_log("Output source priority: ", rating[17]);
    inverterData.system.settings.outputSourcePriority = rating[17]
    debug_log("Charger source priority : ", rating[18]);
    inverterData.system.settings.chargerSourcePriority = rating[18]
    debug_log("Parallel max num: ", rating[19]);
    inverterData.system.settings.parallelMaxNum = rating[19]
    debug_log("Machine type : ", rating[20]);
    inverterData.system.settings.machineType = rating[20]
    debug_log("Topology: ", rating[21]);
    inverterData.system.settings.topology = rating[21]
    debug_log("Output mode: ", rating[22]);
    inverterData.system.settings.outputMode = rating[22]
    debug_log("Battery re-discharge voltage : ", rating[23]);
    inverterData.system.settings.batteryReDischargeVoltage = rating[23]
    debug_log("PV OK condition for parallel: ", rating[24]);
    inverterData.system.settings.pvOKparallel = rating[24]
    debug_log("PV power balance: ", rating[25]);
    inverterData.system.settings.pvPowerBalance = rating[25]
  } else if (command == "QPIWS") {
    var warnings = data.toString().replace(/[^\w.]+/g, " ").split(" ")[1].split("");
    debug_log("Faults:")

    for (var fault in inverterData.system.faults) {
      // skip loop if the property is from prototype
      if (!inverterData.system.faults.hasOwnProperty(fault)) continue;

      // reset status so we can set it from data
      inverterData.system.faults[fault] = false;
    }

    if (warnings[1] == 1) {
      debug_log("Inverter Fault")
      inverterData.system.faults.inverter = true
    }
    if (warnings[2] == 1) {
      debug_log("Bus Over Fault")
      inverterData.system.faults.busOver = true
    }
    if (warnings[3] == 1) {
      debug_log("Bus Under Fault")
      inverterData.system.faults.busUnder = true
    }
    if (warnings[4] == 1) {
      debug_log("Bus Soft Fault")
      inverterData.system.faults.busSoft = true
    }
    if (warnings[5] == 1) {
      debug_log("Line Fail Fault")
      inverterData.system.faults.lineFail = true
    }
    if (warnings[6] == 1) {
      debug_log("OPV Short Fault")
      inverterData.system.faults.opvShort = true
    }
    if (warnings[7] == 1) {
      debug_log("Inverter Voltage Low Fault")
      inverterData.system.faults.invVoltLow = true
    }
    if (warnings[8] == 1) {
      debug_log("Inverter Voltage High Fault")
      inverterData.system.faults.invVoltHigh = true
    }
    if (warnings[9] == 1) {
      debug_log("Over Temp Fault")
      inverterData.system.faults.overTemp = true
    }
    if (warnings[10] == 1) {
      debug_log("Fan Locked Fault")
      inverterData.system.faults.fanLocked = true
    }
    if (warnings[11] == 1) {
      debug_log("Battery Voltage High Fault")
      inverterData.system.faults.batVoltHigh = true
    }
    if (warnings[12] == 1) {
      debug_log("Battery Voltage Low Fault")
      inverterData.system.faults.batVoltLow = true
    }
    if (warnings[13] == 1) {
      debug_log("reserved Fault")
      // inverterData.system.faults.xxx = true
    }
    if (warnings[14] == 1) {
      debug_log("Battery Under Shutdown Faultt")
      inverterData.system.faults.batUnderShutdown = true
    }
    if (warnings[15] == 1) {
      debug_log("reserved Fault")
      // inverterData.system.faults.xxx = true
    }
    if (warnings[16] == 1) {
      debug_log("Overload Fault")
      inverterData.system.faults.overload = true
    }
    if (warnings[17] == 1) {
      debug_log("EEPROM Fault")
      inverterData.system.faults.eepromFault = true
    }
    if (warnings[18] == 1) {
      debug_log("Inverter Over Current Fault")
      inverterData.system.faults.invOverCurrent = true
    }
    if (warnings[19] == 1) {
      debug_log("Inverter Soft Fail Fault")
      inverterData.system.faults.invSoftFail = true
    }
    if (warnings[20] == 1) {
      debug_log("Inverter Self Test Fail Fault")
      inverterData.system.faults.invSelfTest = true
    }
    if (warnings[21] == 1) {
      debug_log("Inverter OP DC Voltage Over Fault")
      inverterData.system.faults.invOPDCvoltOver = true
    }
    if (warnings[22] == 1) {
      debug_log("Inverter Bat Open Fault")
      inverterData.system.faults.invBatOpen = true
    }
    if (warnings[23] == 1) {
      debug_log("Inverter Current Sensor Fault")
      inverterData.system.faults.invCurSensorFail = true
    }
    if (warnings[24] == 1) {
      debug_log("Inverter Battery Short Fault")
      inverterData.system.faults.invBatShort = true
    }
    if (warnings[25] == 1) {
      debug_log("Inverter Power Limit Warning")
      inverterData.system.faults.invPowerLimiting = true
    }
    if (warnings[26] == 1) {
      debug_log("PV Voltage High Warning")
      inverterData.system.faults.pvVoltHigh = true
    }
    if (warnings[27] == 1) {
      debug_log("MPPT Overload Fault")
      inverterData.system.faults.mpptOverloadFault = true
    }
    if (warnings[28] == 1) {
      debug_log("MPPT Overload Warning")
      inverterData.system.faults.mpptOverloadWarn = true
    }
    if (warnings[29] == 1) {
      debug_log("Battery too low to charge Warning")
      inverterData.system.faults.batTooLowtoCharge = true
    }
    if (warnings[30] == 1) {
      debug_log("reserved Fault")
      // inverterData.system.faults.xxx = true
    }
    if (warnings[31] == 1) {
      debug_log("reserved Fault")
      // inverterData.system.faults.xxx = true
    }
  } else if (command == "QPI") { // Device protocol ID
    var protocol = data.toString().replace(/[^\w.]+/g, " ").split(" ")[1]
    debug_log(protocol)
    inverterData.system.protocol = protocol
  } else if (command == "QID") { // Serial Number
    var id = data.toString().replace(/[^\w.]+/g, " ").split(" ")[1]
    debug_log(id)
    inverterData.system.serialnumber = id;
  } else if (command == "QVFW") { // Device protocol ID
    var fw1 = data.toString().replace(/[^\w.]+/g, " ").split(" ")[2]
    debug_log(fw1)
    inverterData.system.firmware.qvfw = fw1
  } else if (command == "QVFW2") { // Device protocol ID
    var fw2 = data.toString().replace(/[^\w.]+/g, " ").split(" ")[2]
    debug_log(fw2)
    inverterData.system.firmware.qvfw2 = fw2
  } else {
    console.log("-------------------")
    console.log("Command: ", command)
    console.log("received: ", data)
  }
})


var commandOrder = 0;
//"QMOD" // Device Mode inquiry
//"QPIGS" // Device general status parameters inquiry
//"QPIRI" // Device Rating Information inquiry
//"QPIWS" // Device Warning Status inquiry
var commandsToRun = ["QMOD", "QPIGS", "QPIRI", "QPIWS", "QPI", "QID", "QVFW", "QVFW2"]
setInterval(function() {

  command = commandsToRun[commandOrder]
  sentBuffer.push(command)
  var crc = compute(command)
  var hexToSend = toHex(command) + crc + "0d"
  var toSend = Buffer.from(hexToSend, 'hex');
  debug_log("sending: ", toSend)
  port.write(toSend)

  if (commandOrder == commandsToRun.length - 1) {
    commandOrder = 0
  } else {
    commandOrder++
  }

  var batteryamps = parseFloat(inverterData.battery.chargingcurrent) - parseFloat(inverterData.battery.dischargecurrent);
  var loadamps = parseFloat(inverterData.inverter.apparentpwr) / parseFloat(inverterData.inverter.voltage);
  // calculate grid load in amps
  var totalLoad = parseFloat(inverterData.inverter.apparentpwr);
  var batteryWatts = (parseFloat(inverterData.battery.voltage) * batteryamps) * -1;
  var solarWatts = parseFloat(inverterData.pv.voltage) * parseFloat(inverterData.pv.current);
  if (inverterData.grid.voltage != 0) {
    var gridamps = ((totalLoad + (batteryWatts * -1)) - solarWatts) / inverterData.grid.voltage
  } else {
    var gridamps = 0
  }

}, 1000);

setInterval(function() {
  io.sockets.emit('inverterData', inverterData);

  client.publish("homeassistant/sensor/inverter_Load_status_on", inverterData.inverter.loadstatus.toString());
  client.publish("homeassistant/sensor/inverter_Inverter_mode", inverterData.system.mode.toString());
  client.publish("homeassistant/sensor/inverter_AC_grid_voltage", inverterData.grid.voltage.toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_AC_grid_frequency", inverterData.grid.freq.toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_AC_out_voltage", inverterData.inverter.voltage.toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_AC_out_frequency", inverterData.inverter.freq.toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_PV_in_voltage", inverterData.pv.voltage.toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_PV_in_current", inverterData.pv.current.toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_PV_in_watts", (inverterData.pv.voltage * inverterData.pv.current).toString());
  client.publish("homeassistant/sensor/inverter_PV_in_watthour", ((inverterData.pv.voltage * inverterData.pv.current) / (3600 / 10)).toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_SCC_voltage", inverterData.battery.sccvoltage.toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_Load_pct", inverterData.inverter.loadpercent.toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_Load_watt", inverterData.inverter.activepower.toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_Load_watthour", (inverterData.inverter.activepower / (3600 / 10)).toFixed(2).toString()); // 1 second
  client.publish("homeassistant/sensor/inverter_Load_va", inverterData.inverter.apparentpwr.toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_Bus_voltage", inverterData.inverter.busvolts.toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_Heatsink_temperature", inverterData.inverter.heatsinktemp.toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_Battery_capacity", inverterData.battery.capacity.toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_Battery_voltage", inverterData.battery.voltage.toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_Battery_charge_current", inverterData.battery.chargingcurrent.toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_Battery_discharge_current", inverterData.battery.dischargecurrent.toFixed(2).toString());
  client.publish("homeassistant/sensor/inverter_SCC_charge_on", inverterData.battery.chargemode.scc.toString());
  client.publish("homeassistant/sensor/inverter_AC_charge_on", inverterData.battery.chargemode.ac.toString());
  client.publish("homeassistant/sensor/inverter_Battery_recharge_voltage", inverterData.system.settings.batteryRechargeVoltage.toString());
  client.publish("homeassistant/sensor/inverter_Battery_under_voltage", inverterData.system.settings.batteryUnderVoltage.toString());
  client.publish("homeassistant/sensor/inverter_Battery_bulk_voltage", inverterData.system.settings.batteryBulkVoltage.toString());
  client.publish("homeassistant/sensor/inverter_Battery_float_voltage", inverterData.system.settings.batteryFloatVoltage.toString());
  client.publish("homeassistant/sensor/inverter_Max_grid_charge_current", inverterData.system.settings.maxACChargingCurrent.toString());
  client.publish("homeassistant/sensor/inverter_Max_charge_current", inverterData.system.settings.maxChargingCurrent.toString());
  client.publish("homeassistant/sensor/inverter_Out_source_priority", inverterData.system.settings.outputSourcePriority.toString());
  client.publish("homeassistant/sensor/inverter_Charger_source_priority", inverterData.system.settings.chargerSourcePriority.toString());
  client.publish("homeassistant/sensor/inverter_Battery_redischarge_voltage", inverterData.system.settings.batteryReDischargeVoltage.toString());
  console.log("----------------updated mqtt-------------------")
}, 10000)


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
    debug_log(printResult)
    // debug_log(crcorder)
    // debug_log(crcpolynom);
    // debug_log(crcinit);
    // debug_log(crcxor);
    // return;
  }


  // convert crc order

  order = parseInt(crcorder, 10);
  if (isNaN(order) == true || order < 1 || order > 64) {
    printResult = "CRC order must be between 1 and 64";
    debug_log(printResult)
    return;
  }


  // convert crc polynom

  polynom = convertentry(crcpolynom, order);
  if (polynom[0] < 0) {
    printResult = "Invalid CRC polynom";
    debug_log(printResult)
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
    debug_log(printResult)
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
        debug_log(printResult)
        return;
      }
      ch = parseInt(data.charAt(++i), 16);
      if (isNaN(ch) == true) {
        printResult = "Invalid data sequence";
        debug_log(printResult)
        return;
      }
      c = parseInt(data.charAt(++i), 16);
      if (isNaN(c) == true) {
        printResult = "Invalid data sequence";
        debug_log(printResult)
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

  // debug_log(printResult)
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
    debug_log('invalid text input: ' + str)
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