import { Loader } from "@googlemaps/js-api-loader"
import React, { useState } from 'react';

import Resources from '../backend/Resources.ts';

import Marker from './Marker.ts';
import Routes from './Routes.ts';
import Vehicles from './Vehicles.ts';
import LoadingScreen from "./LoadingScreen.tsx";

// Map Component
export default function Map() {
    const [mapLoaded, setMapLoaded] = useState(false);

    let center = { lat: 44.97369560732433, lng: -93.2317259515601 }; // UMN location
    const zoom = 15;

    // Comes from the .env.local file, just for security. Won't appear in main -- all api keys should be added to Vercel console. 
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

    if (!mapLoaded) {
        return <div id="map"></div>;
    }
    else {
        return <LoadingScreen />
    }
}

// // Runs on map creation
async function initMap(map : google.maps.Map) { 

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