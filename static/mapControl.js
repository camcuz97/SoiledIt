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

      //Draw for the first time
      redrawPolygon();
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

    //Here, we would call the python script to check out the data!
  }
}

function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}
