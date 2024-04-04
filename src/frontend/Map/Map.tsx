import { Loader } from "@googlemaps/js-api-loader"
import React, { useEffect, useState } from 'react';

import Resources from '../../backend/Resources.ts';

import Marker from './Marker.ts';
import Routes from './Routes.ts';
import Vehicles from './Vehicles.ts';
import LoadingScreen from "./LoadingScreen.tsx";
import URL from '../../backend/URL.ts';


import notificationapi from 'notificationapi-node-server-sdk';

/**
 * The map component
 */
export default function Map() {
  const [mapLoaded, setMapLoaded] = useState(false);


  const sendNotification = () => {

    notificationapi.init(
      '153o85ulan8g6cpeb2ncav2k71', // clientId
      '100k28pdtfaosebgk44brddcfv1ja3j7p8fa3rtdhnsu3u2mrh01'// clientSecret
    )
    
    notificationapi.send({
      notificationId: 'new_comment',
      user: {
        id: "phu00003@umn.edu",
        email: "phu00003@umn.edu",
        number: "+15005550006" // Replace with your phone number
      },
      mergeTags: {
        "comment": "Build something great :)",
        "commentId": "commentId-1234-abcd-wxyz"
      }
    })
  }






  useEffect(() => {
    const init = async () => {
      let center = { lat: 44.97369560732433, lng: -93.2317259515601 }; // UMN location
      const zoom = 15;

      // Comes from the .env.local file, just for security. Won't appear in main -- all api keys should be added to Vercel console. 
      const apiKey = process.env.REACT_APP_API_KEY ? process.env.REACT_APP_API_KEY : "";

      // Load map resources
      const loader = new Loader({
        apiKey: apiKey,
        version: "weekly",
        libraries: ["places", "geometry", "marker"]
      });

      // Creates the map
      const { Map } = await loader.importLibrary("maps");
      const map = new Map(document.getElementById("map") as HTMLElement, {
        center: center,
        zoom: zoom,
        mapId: process.env.REACT_APP_MAP_ID
      });


      // Loads the Route's Resources
      await Resources.load()

      // Sets the Routes map to this map
      Routes.setMap(map)

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
    init().then(() => { setMapLoaded(true) });
  }, [])
  return <><button onClick={sendNotification}>hi</button><LoadingScreen hidden={mapLoaded}></LoadingScreen><div id="map"></div> </>;
}

