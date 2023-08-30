var socket;

$(document).ready(function() {
  socket = io();

  socket.on('inverterData', function(data) {

    //console.log("inverterData", data);
    document.getElementById("json").textContent = JSON.stringify(data, undefined, 2);

    var batteryamps = parseFloat(data.battery.chargingcurrent) - parseFloat(data.battery.dischargecurrent);
    var loadamps = parseFloat(data.inverter.apparentpwr) / parseFloat(data.inverter.voltage);
    // calculate grid load in amps
    var totalLoad = parseFloat(data.inverter.apparentpwr);
    var batteryWatts = (parseFloat(data.battery.voltage) * batteryamps) * -1;
    var solarWatts = parseFloat(data.pv.voltage) * parseFloat(data.pv.current);
    if (data.grid.voltage != 0) {
      var gridamps = ((totalLoad + (batteryWatts * -1)) - solarWatts) / data.grid.voltage
    } else {
      var gridamps = 0
    }

    // Running Info
    $('#solar-volt').html(data.pv.voltage + " volts");
    $('#solar-amp').html(data.pv.current + " amps");
    $('#solar-power').html(solarWatts.toFixed(2) + " watt");

    $('#grid-volt').html(data.grid.voltage + " volts / " + data.grid.freq + "Hz");
    $('#grid-amp').html(gridamps.toFixed(2) + " amps");
    $('#grid-power').html((gridamps * data.grid.voltage).toFixed(2) + " watt");

    $('#load-volt').html(data.inverter.voltage + " volts / " + data.inverter.freq + "Hz");
    $('#load-amp').html(loadamps.toFixed(2) + " amps");
    $('#load-power').html(data.inverter.apparentpwr + " watt / " + data.inverter.loadpercent + "%");

    $('#battery-volt').html(data.battery.voltage + "volts  / " + data.battery.capacity + "%");
    $('#battery-amp').html(batteryamps + " amps");
    $('#battery-power').html(batteryWatts + "watt");

    $('#inverter-mode').html(data.system.mode);
    $('#inverter-serial').html(data.system.serialnumber);
    $('#inverter-fw').html(data.system.firmware.qvfw + " / " + data.system.firmware.qvfw2);
    $('#inverter-temp').html(data.inverter.heatsinktemp + "&degC");

    // Settings
    $("#curVal01").html(data.system.settings.outputSourcePriority) // Setting 01
    $("#curVal02").html(data.system.settings.maxChargingCurrent) // Setting 02
    $("#curVal03").html(data.system.settings.inputVoltageRange) // Setting 03
    $("#curVal05").html(data.system.settings.batteryType) // Setting 05
    $("#curVal06").html(data.system.flags.overloadRestart); // Setting 06
    $("#curVal07").html(data.system.flags.overtempRestart); // Setting 07
    $("#curVal09").html(data.system.settings.acOutputCFreqRating) // Setting 09
    $("#curVal10").html(data.system.settings.acOutputVoltRating) // Setting 10
    $("#curVal11").html(data.system.settings.maxACChargingCurrent) // Setting 11
    $("#curVal12").html(data.system.settings.batteryRechargeVoltage) // Setting 12
    $("#curVal13").html(data.system.settings.batteryReDischargeVoltage) // Setting 13
    $("#curVal16").html(data.system.settings.chargerSourcePriority) // Setting 16
    $("#curVal18").html(data.system.flags.alarm); // Setting 18
    $("#curVal19").html(data.system.flags.lcdReturnToDefault); // Setting 19
    $("#curVal20").html(data.system.flags.backlight); // Setting 20
    $("#curVal22").html(data.system.flags.primarySourceAlarm); // Setting 22
    $("#curVal23").html(data.system.flags.overloadBypass); // Setting 23
    $("#curVal25").html(data.system.flags.faultCodeRecord); // Setting 25
    $("#curVal26").html(data.system.settings.batteryBulkVoltage) // Setting 26
    $("#curVal27").html(data.system.settings.batteryFloatVoltage) // Setting 27
    $("#curVal29").html(data.system.settings.batteryUnderVoltage) // Setting 29
    ///$("#curVal").html(data.system.flags.powerSaving); // Setting ???

  });

});


function unpackData(arr, key) {
  return arr.map(obj => obj[key])
}

// Configuration Functions

//3.1 PE<XXX>/PD<XXX><CRC><cr>: setting some status enable/disable
//Computer: PE<XXX>/PD<XXX><CRC><cr>
//Device: (ACK<CRC><cr> if DEVICE accepts this command, otherwise, responds (NAK<cr>
//PExxxPDxxx set flag status. PE means enable, PD means disable
//x Control setting
//A Enable/disable silence buzzer or open buzzer (Setting 18)
//B Enable/disable overload bypass (Setting 23)
//J Enable/Disable power saving (Setting )
//K Enable/Disable LCD display escape to default page after 1min timeout (Setting 19)
//U Enable/Disable overload restart (Setting 06)
//V Enable/Disable over temperature restart (Setting 07)
//X Enable/Disable backlight on (Setting 20)
//Y Enable/Disable alarm on when primary source interrupt (Setting 22)
//Z Enable/Disable fault code record (Setting 25)
//PEa / PDa (Enable/disable buzzer)
//PEb / PDb (Enable/disable overload bypass)
//PEj / PDj (Enable/disable power saving)
//PEu / PDu (Enable/disable overload restart)
//PEx / PDx (Enable/disable backlight)

// 3.2 Restore Factory Defaults
// 3.2 PF<cr>: Setting control parameter to default value

// 3.3 F<nn><cr>: Setting device output rating frequency
// Computer: F<nn><CRC><cr>
// Device: (ACK<CRC><cr> if device accepts this command, otherwise, responds
// (NAK<CRC><cr>
// Set UPS output rating frequency to 50Hz.or 60Hz
// (Setting 09)

// 3.4 POP<NN><cr>: Setting device output source priority
// Computer: POP<NN><CRC><cr>
// Device: (ACK<CRC><cr> if device accepts this command, otherwise, responds
// (NAK<CRC><cr>
// Set output source priority, 00 for utility first, 01 for solar first, 02 for SBU priority
// (Setting 01)


// 3.5 PBCV<nn.n><cr>: Set battery re-charge voltage
// Computer: PBCV<nn.n><CRC><cr>
// Device: (ACK<CRC><cr> if device accepts this command, otherwise, responds (NAK<CRC><cr>
// 12V unit: 11V/11.3V/11.5V/11.8V/12V/12.3V/12.5V/12.8V
// 24V unit: 22V/22.5V/23V/23.5V/24V/24.5V/25V/25.5V
// 48V unit: 44V/45V/46V/47V/48V/49V/50V/51V
// (Setting 12?)


// 3.6 PBDV<nn.n><cr>: Set battery re-discharge voltage
// Computer: PBDV<nn.n><CRC><cr>
// Device: (ACK<CRC><cr> if device accepts this command, otherwise, responds (NAK<CRC><cr>
// 12V unit: 00.0V12V/12.3V/12.5V/12.8V/13V/13.3V/13.5V/13.8V/14V/14.3V/14.5
// 24V unit: 00.0V/24V/24.5V/25V/25.5V/26V/26.5V/27V/27.5V/28V/28.5V/29V
// 48V unit: 00.0V48V/49V/50V/51V/52V/53V/54V/55V/56V/57V/58V
// 00.0V means battery is full(charging in float mode).
// (Setting 13?)

// 3.7 PCP<NN><cr>: Setting device charger priority
// Computer: PCP<NN><CRC><cr>
// Device: (ACK<CRC><cr> if device accepts this command, otherwise, responds
// (NAK<CRC><cr>
// Set output source priority,
//  For HS: 00 for utility first, 01 for solar first, 02 for solar and utility, 03 for only solar charging
//  For MS: 00 for utility first, 01 for solar first, 03 for only solar charging
// (Setting 16)

// 3.8 PGR<NN><cr>: Setting device grid working range
// Computer: PGR<NN><CRC><cr>
// Device: (ACK<CRC><cr> if device accepts this command, otherwise, responds (NAK<cr>
// Set device grid working range, 00 for appliance, 01 for UPS
// (Setting 03)

// 3.9 PBT<NN><cr>: Setting battery type
// Computer: PBT<NN><CRC><cr>
// Device: (ACK<CRC><cr> if device accepts this command, otherwise, responds
// (NAK<CRC><cr>
// Set device grid working range, 00 for AGM, 01 for Flooded battery .
// (Setting 05)

// 3.10 PSDV<nn.n><cr>: Setting battery cut-off voltage (Battery under voltage)
// Computer: PSDV <nn.n><CRC><cr>
// Device: (ACK<CRC><cr> if device accepts this command, otherwise, responds (NAK<CRC><cr>
//  nn.n: 40.0V ~ 48.0V for 48V unit
// (Setting 29)

// 3.11 PCVV<nn.n><cr>: Setting battery C.V. (constant voltage) charging voltage
// Computer: PCVV <nn.n><CRC><cr>
// Device: (ACK<CRC><cr> if device accepts this command, otherwise, responds (NAK<CRC><cr>
//  nn.n: 48.0V ~ 58.4V for 48V unit
// (Setting 26)

// 3.12 PBFT<nn.n><cr>: Setting battery float charging voltage
// Computer: PBFT <nn.n><CRC><cr>
// Device: (ACK<CRC><cr> if device accepts this command, otherwise, responds (NAK<CRC><cr>
//  nn.n: 48.0V ~ 58.4V for 48V unit
// (Setting 27)

// 3.13 PPVOKC<n ><cr>: Setting PV OK condition
// Computer: PPVOKC <n><CRC><cr>
// Device: (ACK<CRC><cr> if device accepts this command, otherwise, responds (NAK<CRC><cr>
//  0: As long as one unit of inverters has connected PV, parallel system will consider PV OK;
// 1: Only all of inverters have connected PV, parallel system will consider PV OK.
// (Not Supported)

// 3.14 PSPB<n ><cr>: Setting Solar power balance
// Computer: PSPB<n><CRC><cr>
// Device: (ACK<CRC><cr> if device accepts this command, otherwise, responds (NAK<CRC><cr>
// 0: PV input max current will be the max charged current;
// 1: PV input max power will be the sum of the max charged power and loads power.
// (Not Supported)

function set(param) {
  console.log("Setting Parameter: " + param + " to the value of " + $("#setting-" + param).val());

  switch (param) {
    case '01':
      // 3.4 POP<NN><cr>: Setting device output source priority
      // Computer: POP<NN><CRC><cr>
      // Device: (ACK<CRC><cr> if device accepts this command, otherwise, responds
      // (NAK<CRC><cr>
      // Set output source priority, 00 for utility first, 01 for solar first, 02 for SBU priority
      // (Setting 01)
      var commandToSend = "POP" + $("#setting-01").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend)
      break;
    case '02': // NAK issue
      break;
    case '03':
      var commandToSend = "PGR" + $("#setting-03").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case '05':
      var commandToSend = "PBT" + $("#setting-05").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case '06':
      var commandToSend = "P" + $("#setting-06").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case '07':
      var commandToSend = "P" + $("#setting-07").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case '09':
      var commandToSend = "F" + $("#setting-09").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case 10:
      // code block
      var val = $("#setting-" + param).val()
      socket.emit("sendCommand", "")
      break;
    case '11':
      var commandToSend = "MUCHGC" + $("#setting-11").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend)
      break;
    case '12':
      var commandToSend = "PBCV" + $("#setting-12").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case '13':
      var commandToSend = "PBDV" + $("#setting-13").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case '16':
      var commandToSend = "PCP" + $("#setting-16").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case '18':
      var commandToSend = "P" + $("#setting-18").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case '19':
      var commandToSend = "P" + $("#setting-19").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case '20':
      var commandToSend = "P" + $("#setting-20").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case '22':
      var commandToSend = "P" + $("#setting-22").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case '23':
      var commandToSend = "P" + $("#setting-23").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case '25':
      var commandToSend = "P" + $("#setting-25").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case '26':
      var commandToSend = "PCVV" + $("#setting-26").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case '27':
      var commandToSend = "PBFT" + $("#setting-27").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case '29':
      var commandToSend = "PSDV" + $("#setting-29").val();
      console.log(commandToSend);
      socket.emit("sendCommand", commandToSend);
      break;
    case 30:
      // code block
      var val = $("#setting-" + param).val()
      socket.emit("sendCommand", "")
      break;
    case 31:
      // code block
      var val = $("#setting-" + param).val()
      socket.emit("sendCommand", "")
      break;
    case 33:
      // code block
      var val = $("#setting-" + param).val()
      socket.emit("sendCommand", "")
      break;
    case 34:
      // code block
      var val = $("#setting-" + param).val()
      socket.emit("sendCommand", "")
      break;
    case 35:
      // code block
      var val = $("#setting-" + param).val()
      socket.emit("sendCommand", "")
      break;
    case 36:
      // code block
      var val = $("#setting-" + param).val()
      socket.emit("sendCommand", "")
      break;
    default:
      // code block
      var val = $("#setting-" + param).val()
      socket.emit("sendCommand", "")
  }
}