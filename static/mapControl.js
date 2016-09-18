var map;
var centerPos;

var firstMarker = null;
var secondMarker = null;

var selectPolygon = null;

var heatEnabled = false; //boolean
var heatMap = null;
var heatData = null;

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
      if(heatEnabled) {
        selectPolygon.setOptions({
          paths: selectPolygon.getPath(),
          strokeColor: '#000000',
          strokeOpacity: 0.5,
          fillOpacity: 0,
          strokeWeight: 2
        });
      } else {
        selectPolygon.setOptions({
          paths: [coords],
          strokeColor: '#FF0000',
          strokeOpacity: 0.5,
          fillColor: '#AA0000',
          fillOpacity: 0.2,
          strokeWeight: 2
        })
      }
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

function redrawHeatMap() {
  console.log("map:" + map + " heatMap:" + heatMap + " heatData:" + heatData);
  if(heatMap == null) {
    heatMap = new google.maps.visualization.HeatmapLayer({
      //gradient: ['#FF0000', '#00FF00'],
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
          var resp = JSON.parse(request.response);
          var dataArray = new Array(resp.length);
          for(var i = 0; i < resp.length; i++) {
            //console.log("\t" + resp[i][0] + " " + resp[i][1] + " " + resp[i][2]);
            dataArray[i] = {location: new google.maps.LatLng(parseFloat(resp[i][0]), parseFloat(resp[i][1])), weight: parseFloat(resp[i][2])};
          }
          //console.log("\tData was DOMString. Value:" + resp);
          //console.log("\tData as JSON object: " + resp);
          heatData = dataArray;
          redrawHeatMap();
        } else {
          console.log("\tType: " + request.responseType);
          console.log("\tData: " + request.resonse);
        }
      }
    };
  }
}
