import React from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import Routes from './gtfs/Routes.ts';
import Vehicles from './gtfs/Vehicles.ts';

// Runs on map creation
async function initMap(map) { 

  // TODO: Add a loading Screen!
  
  // Loads the Route's Resources
  await Routes.Resouces.load()

  // Sets the Routes map to this map
  Routes.setMap(map)
  Vehicles.setMap(map)

  // Loads the static routes
  Routes.refresh()

  // User Location Marker
  const userLocation = new window.google.maps.Marker({
    map: map,
    label: "You"
  })

  // Centers at User Location
  navigator.geolocation.getCurrentPosition(position => { 
    if (position.coords.accuracy < 1000) // If accuraccy is too low, don't center
      map.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude })
    
    // console.log(position)
  })
  
  // Updates vehicle postions every 0.5 seconds
  setInterval(() => { 
    Vehicles.refresh()

    // Updates User Location
    navigator.geolocation.getCurrentPosition(position => { 
      userLocation.setPosition({ lat: position.coords.latitude, lng: position.coords.longitude })
      userLocation.setVisible(position.coords.accuracy < 1000) // If accuraccy is too low, don't display
    })
  }, 500); // ms of wait
  
}

export default function Map() {
  let center = { lat: 44.97369560732433, lng: -93.2317259515601 }; // UMN location
  const zoom = 15;
  
  return (
    <>
      <LoadScript
        // Comes from the .env file, just for security
        googleMapsApiKey = {process.env.REACT_APP_API_KEY}
        libraries={(process.env.REACT_APP_LIBRARIES).split(",")}
      >
        <GoogleMap
        mapContainerStyle={
          {width: "100%",
          height: "90%",}
        }
        zoom={zoom}
        center={center}
        onLoad={initMap}
        id='google-map'
        >

        </GoogleMap>

      </LoadScript>
    </>
  );
}