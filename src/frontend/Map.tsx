import React from 'react';

import Resources from '../backend/Resources.ts';

import Marker from './Marker.ts';
import Routes from './Routes.ts';
import Vehicles from './Vehicles.ts';

import { Loader } from "@googlemaps/js-api-loader"

// Map Component
export default function Map() {
    let center = { lat: 44.97369560732433, lng: -93.2317259515601 }; // UMN location
    const zoom = 15;

    // Comes from the .env.local file, just for security
    const apiKey = process.env.REACT_APP_API_KEY ? process.env.REACT_APP_API_KEY : "";

    // Load map resources
    const loader = new Loader({
        apiKey: apiKey,
        version: "weekly",
        libraries: ["places", "geometry"]
    });

    // Creates the map
    loader.importLibrary("maps").then(({ Map }) => {
        initMap(new Map(document.getElementById("map") as HTMLElement, {
            center: center,
            zoom: zoom,
        }));
    })

    return <div id="map"></div>;
}

// // Runs on map creation
async function initMap(map : google.maps.Map) { 

    // TODO: Add a loading Screen!
    
    // Loads the Route's Resources
    await Resources.load()
    
    // Sets the Routes map to this map
    Routes.setMap(map)
    Vehicles.setMap(map)
  
    // Loads the static routes
    Routes.refresh()
  
    // Initalizes the user's marker
    Marker.init(map);
  
    // Updates vehicle and marker postions every 0.5 seconds
    setInterval(() => { 
      Vehicles.refresh();
      Marker.update();
    }, 500); // ms of wait
    
  }