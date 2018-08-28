import React, { Component } from 'react'
//import logo from './logo.svg' -- pending
import './App.css'
//extra modules
import axios from 'axios'


class App extends Component {

// initialize relevant states
  state = {
    venues: [],
    query: '',
    searchedPlaces: [],
  }

//DOM manipulation starter point after everything is loaded
  componentDidMount() {
    this.getVenues()
  }

// function to work with foursquare API
  getVenues = () => {
    const endPoint = "https://api.foursquare.com/v2/venues/explore?"
    const parameters = {
      client_id: "GP221WGY2XRXF52ILMRMB02V2BQHE10D5M3WN1ELCZLDTYOJ",
      client_secret: "3N3MKTZUAZXWQM50U3MAGTMXWBIF2TX5W3CLHOAVSKKF1VXH",
      section: "topPicks",
      near: "Freiburg",
      limit: 10,
      v: "20180323"
    }

  // request handler helping to get information as previously defined in above function
    axios.get(endPoint + new URLSearchParams(parameters))
      .then(response => {
        this.setState({
          venues: response.data.response.groups[0].items
        },
        this.renderMap())
      })
      .catch(error => {
        alert("Error:" + error)
      })
  }

// render map - remember to default google maps API once done with app
  renderMap = () => {
    loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyDZ_9WtXs8_DJBGs-4DlLyqEU0yelwlIrU&callback=initMap")
    window.initMap = this.initMap
  }

// initialize map
  initMap = () => {
    const map = new window.google.maps.Map(document.getElementById("map"), {
      container: "map",
      center: {lat: 48.0053677, lng: 7.8232529},
      mapTypeControl: false,
      disableDoubleClickZoom: true,
      clickableIcons: false,
      gestureHandling: 'cooperative'
    })

  // define certain values to be displayed in infoWindow
    let infoWindow = new window.google.maps.InfoWindow();
    let bounds = new window.google.maps.LatLngBounds();
    this.state.venues.map(myVenue => {
      var name = myVenue.venue.name
      var addressStreet = myVenue.venue.location.formattedAddress[0]
      var addressTown = myVenue.venue.location.formattedAddress[1]
      var venueType = myVenue.venue.categories[0].shortName

  // create marker from foursquare location data
      let marker = new window.google.maps.Marker({
        position: {lat: myVenue.venue.location.lat, lng: myVenue.venue.location.lng},
        animation: window.google.maps.Animation.DROP,
        map: map,
        title: myVenue.venue.name,
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',      
      })

  // define map window boundaries to show all markers on map        
    bounds.extend(marker.position)

  // set map view to above definded boundaries to show all markers
    // not always working 100%, don't know why :(    
    map.fitBounds(bounds);

  // define content of infoWindow
      var contentString =
        '<div class="infoWindowTitle"><div class="title"><b>' + name + "</b></div>" +
        '<div class="infoWindowType"><span class="locationType">Location Type: </span><b>' + venueType + "</b></div>" +
        '<div class="infoWindowAddress">' + addressStreet + "</div>" +
        '<div class="infoWindowTown">' + addressTown + "</div>"

  // open infoWindow on click, move and zoom map to marker and change marker icon
      marker.addListener("click", function() {
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png')
        infoWindow.open(map, marker)
        infoWindow.setContent(contentString)
        map.panTo(this.getPosition())
        map.setZoom(16)
      })

  //close info window on random click in map window, reset view and reset marker to default
      map.addListener("click", function() {               
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
        map.panTo({lat: 48.0053677, lng: 7.8232529})
        map.fitBounds(bounds) 
        infoWindow.close()
      })

  //close info window, reset view and reset marker to default    
      infoWindow.addListener("closeclick", function() {
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
        map.panTo({lat: 48.0053677, lng: 7.8232529})
        map.fitBounds(bounds)
      })
    })
  }

// render page, sidebar, search field(inop), header, footer
  // clicking list item works, but I can't figure out how to make the related infoWindow show
  render() {
    return (
      <main>
        <div className="App">
          <section id="navigation" label="navigation">
            <nav className="heading" label="header">
              <header id="header"><span className="pageName">Freiburg's Finest: </span>Foursquare's Top10 locations in Freiburg im Breisgau, Germany</header>
            </nav>
            <button className="toggleButton" onClick={showHide}>toggle sidebar</button>            
          </section>
          <div id="map" role="application"></div>
        </div>
        <nav id="locationList" aria-label="location-list" tabIndex="0" >          
          <ul className="menu-list" role="navigation" aria-label="list-menu" id="myUl" tabIndex="1">
            <input type="text" id="myInput" name="search" aria-label="input-search" placeholder="Search Venues..."/> {
              this.state.venues.map((element) => ( 
                <li className="list-item" key={element.venue.name}><a href="javascript:window.google.maps.event.trigger(this.infoWindow,'click');">{element.venue.name}</a></li>
                )
              )
            }            
          </ul> 
        </nav>
        <nav className="footing" label="footer">
          <header id="footer"><span className="pageName">Freiburg's Finest </span>uses <a href="https://cloud.google.com/maps-platform/" target="_blank" rel="noreferrer noopener">Google Maps API</a> and <a className="foursquareLink" href="https://developer.foursquare.com/places-api" target="_blank" rel="noreferrer noopener">Foursquare API</a></header>
        </nav>
      </main>
    )
  }
}

// failed attempt to make the sidebar show/hide on toggle button click
function showHide() {
    var x = document.getElementById("locationList");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

// google error handling - appears always but I don't see why
function googleMapsError() {
    alert("An error occurred with Google Maps!");
}

// async, defer and error handling script
function loadScript(url, onloadFunction) {
  var index  = window.document.getElementsByTagName("script")[0]
  var script = window.document.createElement("script")
  script.src = url
  script.async = true
  script.defer = true
  script.onerror = googleMapsError()
  if (onloadFunction) { script.onload = onloadFunction; }
  index.parentNode.insertBefore(script, index)

}

export default App;