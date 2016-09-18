var map;                  //The google maps object- where we draw everything to
var centerPos;            //The initial center position of the map

var firstMarker = null;   //The first placed marker
var secondMarker = null;  //The second placed marker

var selectPolygon = null; //Boundary polygon of current selection

var heatEnabled = false;  //Is the heat map turned on?
var heatMap = null;       //The heatmap layer object
var heatData = null;      //The currently displayed heatmap data

var tspPoly = null;

function initMap() {
  centerPos = new google.maps.LatLng(40.0, -88.0);

  map = new google.maps.Map(document.getElementById('map'), {
    center: centerPos,
    zoom: 14,
    mapTypeId: 'hybrid'
  });

  map.addListener('click', function(event) {
    if(firstMarker == null) {
      firstMarker = new google.maps.Marker({
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: event.latLng
      });

      //Make the marker listen to changes and update as needed
      firstMarker.addListener('position_changed', function(event) {
        redrawPolygon();
      });

      //When we finalize a choice, request updated data
      firstMarker.addListener('dragend', function(event) {
        requestData();
      });
    } else if(secondMarker == null) {
      secondMarker = new google.maps.Marker({
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: event.latLng
      });

      //Make the marker listen to changes and update as needed
      secondMarker.addListener('position_changed', function(event) {
        redrawPolygon();
      });

      //When we finalize a choice, request updated data
      secondMarker.addListener('dragend', function(event) {
        requestData();
      });

      //Draw & get data for the first time
      redrawPolygon();
      requestData();
    }
  });
}

function redrawPolygon() {
  if(firstMarker != null && secondMarker != null) {
    var lat1 = firstMarker.getPosition().lat();
    var lng1 = firstMarker.getPosition().lng();
    var lat2 = secondMarker.getPosition().lat();
    var lng2 = secondMarker.getPosition().lng()

    var x1 = Math.min(lat1, lat2); //lowest lat
    var y1 = Math.min(lng1, lng2); //lowest lng
    var x2 = Math.max(lat1, lat2); //highest lat
    var y2 = Math.max(lng1, lng2); //highest lng

    var coords = [
      {lat: x1, lng: y1}, //nw
      {lat: x1, lng: y2}, //sw
      {lat: x2, lng: y2}, //se
      {lat: x2, lng: y1}, //ne
      {lat: x1, lng: y1}  //back around
    ];

    var normalOptions = {
      paths: [coords],
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      fillColor: '#AA0000',
      fillOpacity: 0.2,
      strokeWeight: 2
    }

    if(selectPolygon == null) {
      //Create a new polygon and draw it
      selectPolygon = new google.maps.Polygon(normalOptions);
      selectPolygon.setMap(map);
    } else {
      //Otherwise, just update the one we already have
      if(heatEnabled) {
        selectPolygon.setOptions({
          paths: [coords],
          strokeColor: '#000000',
          strokeOpacity: 0.5,
          fillOpacity: 0,
          strokeWeight: 2
        });
      } else {
        selectPolygon.setOptions(normalOptions);
      }
    }
  }
}

function redrawHeatMap() {
  if(heatMap == null) {
    heatMap = new google.maps.visualization.HeatmapLayer({
      dissipating: true,
      maxIntensity: 0.75,
      data: heatData,
      radius: 75,
      opacity: 0.5
    });
    selectPolygon.setOptions({
      paths: selectPolygon.getPath(),
      strokeColor: '#000000',
      strokeOpacity: 0.5,
      fillOpacity: 0,
      strokeWeight: 2
    });
    heatMap.setMap(map);
    heatEnabled = true;
  } else {
    heatMap.setData(heatData);
    heatMap.setMap(map)
  }

  if(heatMap == null) {
    if(heatData !== null) {
      heatMap = new google.maps.visualization.HeatmapLayer({
      });
      heatMap.setMap(map);
    }
  } else if(heatData !== null) {
  }
}

function requestData() {
  if(selectPolygon !== null) {
    var lat1 = firstMarker.getPosition().lat();
    var lng1 = firstMarker.getPosition().lng();
    var lat2 = secondMarker.getPosition().lat();
    var lng2 = secondMarker.getPosition().lng();

    var x1 = Math.min(lat1, lat2); //lowest lat
    var y1 = Math.min(lng1, lng2); //lowest lng
    var x2 = Math.max(lat1, lat2); //highest lat
    var y2 = Math.max(lng1, lng2); //highest lng

    var str = "select" +
      "?minlat=" + x1 +
      "&minlng=" + y1 +
      "&maxlat=" + x2 +
      "&maxlng=" + y2;

    var request = new XMLHttpRequest();
    request.open("POST", str);
    request.send("");
    request.onreadystatechange = function() { //When ready
      if(request.readyState === 4 && request.responseType === "") {
        var resp = JSON.parse(request.response);
        var dataArray = new Array(resp.length);
        for(var i = 0; i < resp.length; i++) {
          dataArray[i] = {
            location: new google.maps.LatLng(
              parseFloat(resp[i][0]),
              parseFloat(resp[i][1])),
            weight: parseFloat(resp[i][2])};
        }
        heatData = dataArray;
        redrawHeatMap();
        travel();
      }
    };
  }
}

function distance(points) {
  var dist = 0;
  for(var j = 0; j < points.length - 1; j++) {
    dist += ((points[j].lat() - points[j+1].lat()) * (points[j].lat() - points[j+1].lat())) +
      ((points[j].lng() - points[j+1].lng()) * (points[j].lng() - points[j+1].lng()));
  }
  return dist;
}

function swap(points, i, j) {
  var temp = points[i];
  points[i] = points[j];
  points[j] = temp;
  return points;
}

function travel() {
  var lat1 = firstMarker.getPosition().lat();
  var lng1 = firstMarker.getPosition().lng();
  var lat2 = secondMarker.getPosition().lat();
  var lng2 = secondMarker.getPosition().lng();

  //Note: 1/69 turns degrees -> miles. Our range is ~3.75 miles
  var magic = (3.75 / 69);

  //If true, then just one square
  //if((Math.abs(Math.abs(lat1) - Math.abs(lat2)) <= magic) &&
  //   (Math.abs(Math.abs(lng1) - Math.abs(lng2)) <= magic)) {

    var data = heatMap.getData();
    var dArray = [];
    for(var i = 0; i < data.getLength(); i++)
      dArray.push(data.getAt(i));
    dArray.sort(function(a, b) {return a.weight - b.weight;});

    var points = [];
    for(var i = 0; i < Math.min(5, data.getLength()) ; i++)
      points.push(dArray[i].location);

    var bestDistance = distance(points);
    for(var i = 0; i < 50; i++) {
      for(var j = 0; j < points.length - 1; j++) {
        points = swap(points, j, j + 1);
        var dist = distance(points);
        if(dist < bestDistance) {
          bestDistance = dist;
        } else {
          points = swap(points, j, j + 1);
        }
      }
    }

    points.unshift(map.getCenter());
    points.push(map.getCenter());

    console.log("Made a line with " + points.length + " points.")
    for(var i = 0; i < points.length; i++)
      console.log(points[i]);

    if(tspPoly == null) {
      tspPoly = new google.maps.Polyline({
        map: map,
        path: points,
        strokeColor: '#0000FF',
        strokeOpacity: 0.7,
        strokeWeight: 3
      });
    } else {
      tspPoly.setOptions({
        map: map,
        path: points,
        strokeColor: '#0000FF',
        strokeOpacity: 0.7,
        strokeWeight: 3
      })
    }
  //}
}
