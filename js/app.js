var map, client_id, client_secret;

var ViewModel = function() {
  var self = this;


  this.locationList = ko.observableArray([]);
  this.selectedLocation = ko.observable();
  this.locationImages = ko.observableArray(['images/default.jpg']);

  this.markers = [];

  //Makes an array of locations
  var populateLocation = function(location) {
    this.title = location.title;
    this.lat = location.lat;
    this.lng = location.lng;
    this.fsid = location.fsid;
    this.display = ko.observable(true);
  };

  for (var i = 0; i < locations.length; i++) {
    self.locationList.push(new populateLocation(locations[i]));
  }

  //Foursquare API call to retrieve photos of location
  this.foursquareImages = function (location) {
    client_id = 'C5P2ZFFKEW4VIZEVTBA5A5ERV0SWXCSEGK04PCOA4VV5E1MT';
    client_secret = 'CIGS4DXLXLSGY0PCQJOAQLV1PC4PQRIUFX2D15TRAQAMD1VW';
    var venue;
    for (var i = 0; i < self.locationList().length; i++) {
      if (self.locationList()[i].title === location.title) {
        venue = self.locationList()[i].fsid;
      }
    }
    var fsUrl = 'https://api.foursquare.com/v2/venues/'+venue+'/photos?limit=2&client_id='+client_id+'&client_secret='+client_secret+'&v=20170801';

    $.ajax({
      url: fsUrl,
      dataType: 'json',
      success:function(apiResponse) {
        self.locationImages().length = 0;
        for (var i = 0; i < apiResponse.response.photos.count; i++) {
          self.locationImages.push(apiResponse.response.photos.items[i].prefix+'width300'+apiResponse.response.photos.items[i].suffix);
        }
      },
      error: function() {
        self.locationImages().length = 0;
        self.locationImages.push('images/default.jpg');
        alert("There was an issue loading Foursquare. Reload to try again!");
      }
    });
  };

  //Decorative Markers
  this.makeMarkerIcon = function(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor + '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21, 34));
    return markerImage;
  };

  //Creates infowindow for a selected marker
  this.populateInfoWindow = function(marker, infowindow) {
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent(
      '<div>'+marker.title+'</div>');
      infowindow.open(map,marker);
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
    }
  };

  //When marker is clicked, an infowindow and relevant photos from Foursquare are displayed
  this.populateMarker = function() {
    self.populateInfoWindow(this, self.infowindow);
    self.foursquareImages(this, self.selectedLocation());
    this.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout((function() {
      this.setAnimation(null);
    }).bind(this),1500);
  };

  //Filters through location list and hides all markers except the selected marker
  //Selected marker will change colour
  this.filterMarker = function(location) {
    if (location !== undefined) {
      for (var i = 0; i < self.markers.length; i++) {
        if (self.markers[i].title == location.title) {
          self.markers[i].setAnimation(google.maps.Animation.DROP);
          self.markers[i].setIcon(self.makeMarkerIcon('d6edf5'));
          self.markers[i].setVisible(true);
        } else {
          self.markers[i].setVisible(false);
        }
      }
    //Makes all markers visible and resets highlighted icon to default colour
    } else {
      for (var j = 0; j < self.markers.length; j++) {
        self.markers[j].setAnimation(google.maps.Animation.DROP);
        self.markers[j].setIcon(self.makeMarkerIcon('f2f2f2'));
        self.markers[j].setVisible(true);
      }
    }
  };

  //Handles selection of a location in the dropdown list
  this.selectLocation = function() {
    if (self.selectedLocation() === undefined) {
      for (var i = 0; i < self.locationList().length; i++) {
        self.locationImages().length = 0;
        self.locationImages.push('images/default.jpg');
      }
      self.infowindow.close();
      self.infowindow.marker = null;
    //When location is chosen, relevant photos and marker with infowindow is displayed
    } else {
      self.foursquareImages(self.selectedLocation());
    }
    self.filterMarker(self.selectedLocation());
  };

  //Handles selection of location in sidebar list
  this.clickList = function(clicked) {
    self.foursquareImages(clicked);
    self.filterMarker(clicked);
  };

  //Loads Google Map API
  this.initMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 49.2827, lng: -123.1207},
      zoom: 11,
      styles: styles
    });

    this.infowindow = new google.maps.InfoWindow();
    var defaultIcon = this.makeMarkerIcon('f2f2f2');
    var highlightedIcon = this.makeMarkerIcon('d6edf5');

    for (var i = 0; i < locations.length; i++) {
      this.title = locations[i].title;
      this.lat = locations[i].lat;
      this.lng = locations[i].lng;
      //Creates a marker per location in an array.
      this.marker = new google.maps.Marker({
        map: map,
        title: this.title,
        position: {
          lat: this.lat,
          lng: this.lng
        },
        icon: defaultIcon,
        animation: google.maps.Animation.DROP,
        id: i
      });
      this.markers.push(this.marker);

      //Mouse Events Handler
      this.marker.addListener('click', self.populateMarker);
    }
  };

  this.initMap();

  //Hamburger sidebar functionality
  this.toggleSidebar = function() {
    document.getElementById("sidebar").classList.toggle('active');
    document.getElementById("nav-toggle").classList.toggle('active');
    document.getElementById("map").classList.toggle('active');
  };
};

//Google API Error handler
mapError = function mapError() {
  alert('Oops. Maps did not load. Reload to try again!');
};

function initApp() {
  ko.applyBindings(new ViewModel());
}