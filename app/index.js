$(document).ready(function() {

  loadData();
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

function loadData() {
  // if (!period) {
  period = "8h"
  // }

  var select = $("#graphperiod").data('select');
  period = select.val()


  var solartimes = [],
    solarwatts = [],
    loadtimes = [],
    loadwatts = [],
    batttimes = [],
    battwatts = [],
    gridtimes = [],
    gridwatts = []


  $.get("/api/v1/inverter/solar?period=" + period + "&date=" + new Date().getTime(), function(data) {
    // console.log(data)
    for (i = 0; i < data.length; i++) {
      solartimes.push(new Date(data[i].time));
      solarwatts.push(data[i].volts * data[i].amps);
    }
  });

  $.get("/api/v1/inverter/load?period=" + period + "&date=" + new Date().getTime(), function(data) {
    // console.log(data)
    for (i = 0; i < data.length; i++) {
      loadtimes.push(new Date(data[i].time));
      loadwatts.push(data[i].volts * data[i].amps);
    }
  });

  $.get("/api/v1/inverter/battery?period=" + period + "&date=" + new Date().getTime(), function(data) {
    // console.log(data)
    for (i = 0; i < data.length; i++) {
      batttimes.push(new Date(data[i].time));
      battwatts.push((data[i].volts * data[i].amps) * -1);
    }
  });

  $.get("/api/v1/inverter/grid?period=" + period + "&date=" + new Date().getTime(), function(data) {
    // console.log(data)
    for (i = 0; i < data.length; i++) {
      gridtimes.push(new Date(data[i].time));
      gridwatts.push((data[i].volts * data[i].amps));
    }
  });


  setTimeout(function() {

    var solarTrace = {
      type: 'scatter',
      mode: 'lines',
      name: 'Solar (W)',
      x: solartimes,
      y: solarwatts,
      line: {
        color: '#00cc00',
        simplify: true
      }
    }

    var loadTrace = {
      type: 'scatter',
      mode: 'lines',
      name: 'Load (W)',
      x: loadtimes,
      y: loadwatts,
      line: {
        color: '#cc0000',
      }
    }

    var battTrace = {
      type: 'scatter',
      mode: 'lines',
      name: 'Battery (W)',
      x: batttimes,
      y: battwatts,
      line: {
        color: '#0000cc',
      }
    }

    var gridTrace = {
      type: 'scatter',
      mode: 'lines',
      name: 'Grid (W)',
      x: gridtimes,
      y: gridwatts,
      line: {
        color: '#cc00cc',
      }
    }

    var data = [solarTrace, loadTrace, battTrace, gridTrace];
    var layout = {
      margin: {
        t: 22,
        b: 35,
        l: 55,
        r: 15
      },
    };
    var config = {
      responsive: true
    }
    return Plotly.newPlot('graph-container', data, layout, config);
  }, 1000)

}