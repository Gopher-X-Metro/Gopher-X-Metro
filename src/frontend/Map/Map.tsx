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
    let z = 0;


    const sendNotification = () =>  {
      
        if (Notification?.permission === "granted") {
            // If the user agreed to get notified
            // Let's try to send ten notifications
            let i = 0;
            // Using an interval cause some browsers (including Firefox) are blocking notifications if there are too much in a certain time.
            const interval = setInterval(() => {
              // Thanks to the tag, we should only see the "Hi! 9" notification
              const n = new Notification(`Hi! ${i}`, { tag: "soManyNotification" });
              if (i === 9) {
                clearInterval(interval);
              }
              i++;
            }, 200);
          } else if (Notification && Notification.permission !== "denied") {
            // If the user hasn't told if they want to be notified or not
            // Note: because of Chrome, we are not sure the permission property
            // is set, therefore it's unsafe to check for the "default" value.
            Notification.requestPermission().then((status) => {
              // If the user said okay
              if (status === "granted") {
                let i = 0;
                
                // Using an interval cause some browsers (including Firefox) are blocking notifications if there are too much in a certain time.
                const interval = setInterval(() => {
                  // Thanks to the tag, we should only see the "Hi! 9" notification
                  alert("TRIED TO NOTIFY");
                  const n = new Notification(`Hi! ${z++}`, {
                    tag: "soManyNotification",
                  });
                  if (i === 9) {
                    clearInterval(interval);
                  }
                  i++;
                }, 200);
              } else {
                // Otherwise, we can fallback to a regular modal alert
                alert("Hi!");
              }
            });
          } else {
            // If the user refuses to get notified, we can fallback to a regular modal alert
            alert("Hi!");
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

