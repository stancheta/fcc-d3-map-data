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

    // format and sort data
    var fData = [];
    data.features.forEach(function(d) {
      if(d.geometry != null) {
        var coord = d.geometry.coordinates;
        var prop = d.properties;
        var mass = prop.mass > 0 ? prop.mass : 1;
        fData.push({
          lat: +coord[1],
          long: +coord[0],
          fall: prop.fall,
          mass: +mass,
          name: prop.name,
          nametype: prop.nametype,
          recclass: prop.recclass,
          reclat: prop.reclat,
          year: prop.year
        });
      }
    });
    fData.sort(function(a, b) { return b.mass - a.mass; });
    var map = new google.maps.Map(d3.select("#map").node(), {
      zoom: 2,
      center: new google.maps.LatLng(0, 0),
      mapTypeId: google.maps.MapTypeId.TERRAIN
    });

    var tooltip = d3.select('#map')
                    .append('div')
                    .attr('class', 'tooltip')
                    .style('opacity', 0);

    var overlay = new google.maps.OverlayView();

    var color = d3.scale.category20();
    var minMass = fData[fData.length - 1].mass;
    var maxMass = fData[0].mass;
    console.log(minMass + ' ' + maxMass);
    var meteoriteSize = d3.scale.log().base(2).domain([minMass, maxMass]).range([5, 35]);
    overlay.onAdd = function() {
      var layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
        .attr("class", "meteorites");

      overlay.draw = function() {
        var projection = this.getProjection();

        var marker = layer.selectAll("svg")
        .data(fData)
        .each(transform) // update existing markers
        .enter().append("svg:svg")
        .each(transform)
        .attr("class", "marker");

        marker.append("svg:circle")
        .attr("r", function(d) { return meteoriteSize(d.mass); })
        .style("fill", function() { return color(Math.floor(Math.random() * 19)); })
        .on('mouseover', function(d) {
          tooltip.transition()
                 .duration(100)
                 .style('opacity', 0.9);
          tooltip.html('<strong>fall:</strong> ' + d.fall + '<br/>' +
                       '<strong>mass:</strong> ' + d.mass + '<br/>' +
                       '<strong>name:</strong> ' + d.name + '<br/>' +
                       '<strong>nametype:</strong> ' + d.nametype + '<br/>' +
                       '<strong>recclass:</strong> ' + d.recclass + '<br/>' +
                       '<strong>reclat:</strong> ' + d.reclat + '<br/>' +
                       '<strong>year:</strong> ' + d.year)
                .style('left', (d3.event.pageX + 30) + 'px')
                .style('top', (d3.event.pageY + 15) + 'px');
        })
        .on('mouseout', function() {
          tooltip.transition()
                 .duration(200)
                 .style('opacity', 0);
        });

        function transform(d) {
          d = new google.maps.LatLng(d.lat, d.long);
          d = projection.fromLatLngToDivPixel(d);
          return d3.select(this)
          .style("left", (d.x) + "px")
          .style("top", (d.y) + "px");
        }
      };
    };
    overlay.setMap(map);
  };

  // setup
  getData(dataURL, handleData);
})();
