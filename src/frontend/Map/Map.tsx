import { Loader } from "@googlemaps/js-api-loader"
import React, { useEffect, useState } from 'react';

import Resources from '../../backend/Resources.ts';

import Marker from './Marker.ts';
import Routes from './Routes.ts';
import Vehicles from './Vehicles.ts';
import LoadingScreen from "./LoadingScreen.tsx";
import { isNotificationSupported, requestNotificationPermission, showNotification } from '../../backend/Notify.ts';

/**
 * The map component
 */
export default function Map() {
  const [mapLoaded, setMapLoaded] = useState(false);


  const sendNotification = () => {
    if (Notification.permission !== 'granted')
      Notification.requestPermission();
    else {
      var notification = new Notification('Notification title', {
        title: 'Notification title',
        iconc: 'public/favicon/favicon.ico',
        body: 'Hey there! You\'ve been notified!',
      });
      notification.onclick = function () {
        window.open('http://stackoverflow.com/a/13328397/1269037');
      };
    }
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

