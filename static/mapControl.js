var map;
var centerPos;

var firstMarker = null;
var secondMarker = null;

var selectPolygon = null;

function initMap() {
  centerPos = new google.maps.LatLng(40.0, -88.0);

  map = new google.maps.Map(document.getElementById('map'), {
    center: centerPos,
    zoom: 16,
    mapTypeId: 'hybrid'
  });

  map.addListener('click', function(event) {
    if(firstMarker == null) {
      //Create a new marker
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
      //Create a new marker
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

    if(selectPolygon == null) {
      //Create a new polygon and draw it
      selectPolygon = new google.maps.Polygon({
        paths: [coords],
        strokeColor: '#FF0000',
        strokeOpacity: 0.5,
        fillColor: '#AA0000',
        fillOpacity: 0.2,
        strokeWeight: 2
      });
      selectPolygon.setMap(map);
    } else {
      //Otherwise, just update the one we already have
      selectPolygon.setPath(coords);
    }
  }
}

function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

function requestData() {
  if(selectPolygon !== null) {
    var lat1 = firstMarker.getPosition().lat();
    var lng1 = firstMarker.getPosition().lng();
    var lat2 = secondMarker.getPosition().lat();
    var lng2 = secondMarker.getPosition().lng()

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
    request.onreadystatechange = function() {
      //console.log("Got back data. Ready state: " +
      //  request.readyState + ", status: " +  request.status);

      //When ready
      if(request.readyState === 4) {
        if(request.responseType === "") {
          var resp = request.response;
          console.log("\tData was DOMString. Value:" + resp);
        } else {
          //console.log("\tType: " + request.responseType);
          //console.log("\tData: " + request.resonse);
        }
      }
    };
  }
}
