/* globals XMLHttpRequest, d3, google*/

// Used Ievgen Pyvovarov's code as an example: http://bl.ocks.org/bsn/1125458

(function() {
  var dataURL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';

  var getData = function(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = JSON.parse(request.responseText);
        callback(data);
      } else {
        // We reached our target server, but it returned an error
        console.log('The Server Returned an Error');
      }
    };
    request.onerror = function() {
      // There was a connection error of some sort
      console.log('There was a connection error');
    };
    request.send();
  };

  var handleData = function(data) {
    var fData = [];
    data.features.forEach(function(d, i) {
      if(d.geometry != null) {
        var coord = d.geometry.coordinates;
        var prop = d.properties;
        fData.push({
          lat: +coord[1],
          long: +coord[0],
          fall: prop.fall,
          mass: +prop.mass,
          name: prop.name,
          nametype: prop.nametype,
          recclass: prop.recclass,
          reclat: prop.reclat,
          year: prop.year
        });
      }
    });
    var map = new google.maps.Map(d3.select("#map").node(), {
      zoom: 2,
      center: new google.maps.LatLng(0, 0),
      mapTypeId: google.maps.MapTypeId.TERRAIN
    });

    var overlay = new google.maps.OverlayView();

    overlay.onAdd = function() {
      var layer = d3.select(this.getPanes().overlayLayer).append("div")
        .attr("class", "meteorites");

      overlay.draw = function() {
        var projection = this.getProjection(),
        padding = 10;

        var marker = layer.selectAll("svg")
        .data(fData)
        .each(transform) // update existing markers
        .enter().append("svg")
        .each(transform)
        .attr("class", "marker");

        marker.append("circle")
        .attr("r", 4.5)
        .attr("cx", padding)
        .attr("cy", padding);

        function transform(d) {
          d = new google.maps.LatLng(d.lat, d.long);
          d = projection.fromLatLngToDivPixel(d);
          return d3.select(this)
          .style("left", (d.x - padding) + "px")
          .style("top", (d.y - padding) + "px");
        }
      };
    };
    overlay.setMap(map);
  };

  // setup
  getData(dataURL, handleData);
})();
