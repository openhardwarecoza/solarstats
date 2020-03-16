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
    console.log(data)
    for (i = 0; i < data.length; i++) {
      solartimes.push(new Date(data[i].time));
      solarwatts.push(data[i].volts * data[i].amps);
    }
  });

  $.get("/api/v1/inverter/load?period=" + period + "&date=" + new Date().getTime(), function(data) {
    console.log(data)
    for (i = 0; i < data.length; i++) {
      loadtimes.push(new Date(data[i].time));
      loadwatts.push(data[i].volts * data[i].amps);
    }
  });

  $.get("/api/v1/inverter/battery?period=" + period + "&date=" + new Date().getTime(), function(data) {
    console.log(data)
    for (i = 0; i < data.length; i++) {
      batttimes.push(new Date(data[i].time));
      battwatts.push((data[i].volts * data[i].amps) * -1);
    }
  });

  $.get("/api/v1/inverter/grid?period=" + period + "&date=" + new Date().getTime(), function(data) {
    console.log(data)
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
        smoothing: 1,
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
        smoothing: 1,
        simplify: true
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
        smoothing: 1,
        simplify: true
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
        smoothing: 1,
        simplify: true
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
    return Plotly.newPlot('graph-container', data, layout);
  }, 1000)





}

$(window).on('load', loadData);
setInterval(loadData, 60000)