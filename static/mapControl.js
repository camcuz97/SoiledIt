var map;                  //The google maps object- where we draw everything to
var centerPos;            //The initial center position of the map

var firstMarker = null;   //The first placed marker
var secondMarker = null;  //The second placed marker

var selectPolygon = null; //Boundary polygon of current selection

var heatEnabled = false;  //Is the heat map turned on?
var heatMap = null;       //The heatmap layer object
var heatData = null;      //The currently displayed heatmap data

function initMap() {
  centerPos = new google.maps.LatLng(40.0, -88.0);

  map = new google.maps.Map(document.getElementById('map'), {
    center: centerPos,
    zoom: 16,
    mapTypeId: 'hybrid'
  });

  map.addListener('click', function(event) {
    if(firstMarker == null) {
      firstMarker = getNewMarker();
    } else if(secondMarker == null) {
      secondMarker = getNewMarker();

      //Draw & get data for the first time
      redrawPolygon();
      requestData();
    }
  });
}

function getNewMarker() {
  var newMarker = new google.maps.Marker({
    map: map,
    draggable: true,
    animation: google.maps.Animation.DROP,
    position: event.latLng
  });

  //Make the marker listen to changes and update as needed
  newMarker.addListener('position_changed', redrawPolygon());

  //When we finalize a choice, request updated data
  newMarker.addListener('dragend', requestData());

  return newMarker;
}

//Get an array of the min/max lat/long - used in drawing
function getMinMax() {
  if(firstMarker == null || secondMarker == null) {
    return [];
  }

  var lat1 = firstMarker.getPosition().lat();
  var lng1 = firstMarker.getPosition().lng();
  var lat2 = secondMarker.getPosition().lat();
  var lng2 = secondMarker.getPosition().lng()

  var x1 = Math.min(lat1, lat2); //lowest lat
  var y1 = Math.min(lng1, lng2); //lowest lng
  var x2 = Math.max(lat1, lat2); //highest lat
  var y2 = Math.max(lng1, lng2); //highest lng

  return [x1, y1, x2, y2];
}

function redrawPolygon() {
  var minMax = getMinMax();

  var coords = [
    {lat: minMax[0], lng: minMax[1]}, //nw
    {lat: minMax[0], lng: minMax[3]}, //sw
    {lat: minMax[2], lng: minMax[3]}, //se
    {lat: minMax[2], lng: minMax[1]}, //ne
    {lat: minMax[0], lng: minMax[1]}  //back around
  ];

  //The default polygon rendering option - red outline, red fill
  var normalOption = {
    paths: [coords],
    strokeColor: '#FF0000',
    strokeOpacity: 0.5,
    fillColor: '#AA0000',
    fillOpacity: 0.2,
    strokeWeight: 2
  };

  if(selectPolygon == null) {
    //Create a new polygon and draw it
    selectPolygon = new google.maps.Polygon(normalOption);
    selectPolygon.setMap(map);
  } else {
    //Otherwise, just update the one we already have
    if(!heatEnabled) {
      selectPolygon.setOptions(normalOption);
    } else { //Heatmap polygon options - black with clear background
      selectPolygon.setOptions({
        paths: [coords],
        strokeColor: '#000000',
        strokeOpacity: 0.5,
        fillOpacity: 0,
        strokeWeight: 2
      });
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
    heatEnabled = true;
  } else {
    heatMap.setData(heatData);
  }
  heatMap.setMap(map);
}

function requestData() {
  if(selectPolygon !== null) {
    var minMax = getMinMax();

    var str = "select" +
      "?minlat=" + minMax[0] +
      "&minlng=" + minMax[1] +
      "&maxlat=" + minMax[2] +
      "&maxlng=" + minMax[3];

    var request = new XMLHttpRequest();
    request.open("GET", str);
    request.send();
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
      }
    };
  }
}
