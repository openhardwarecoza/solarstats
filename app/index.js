$(document).ready(function() {

  setInterval(loadData, 60000)

  var socket = io();

  socket.on('inverterData', function(data) {

    // console.log("inverterData", data);
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

    $('#solar-volt').html(data.pv.voltage.toFixed(1) + " volts");
    $('#solar-amp').html(data.pv.current.toFixed(1) + " amps");
    $('#solar-power').html(solarWatts.toFixed(1) + " watt");

    $('#grid-volt').html(data.grid.voltage.toFixed(1) + " volts / " + data.grid.freq + "Hz");
    $('#grid-amp').html(gridamps.toFixed(1) + " amps");
    $('#grid-power').html((gridamps * data.grid.voltage).toFixed(1) + " watt");

    $('#load-volt').html(data.inverter.voltage.toFixed(1) + " volts / " + data.inverter.freq + "Hz");
    $('#load-amp').html(loadamps.toFixed(1) + " amps");
    $('#load-power').html(data.inverter.apparentpwr.toFixed(1) + " watt / " + data.inverter.loadpercent.toFixed(0) + "%");

    $('#battery-volt').html(data.battery.voltage.toFixed(1) + "volts  / " + data.battery.capacity.toFixed(0) + "%");
    $('#battery-amp').html(batteryamps.toFixed(1) + " amps");
    $('#battery-power').html(batteryWatts.toFixed(1) + "watt");

    $('#inverter-mode').html(data.system.mode);
    $('#inverter-serial').html(data.system.serialnumber);
    $('#inverter-fw').html(data.system.firmware.qvfw + " / " + data.system.firmware.qvfw2);
    $('#inverter-temp').html(data.inverter.heatsinktemp + "&degC");

  });

});


function unpackData(arr, key) {
  return arr.map(obj => obj[key])
}