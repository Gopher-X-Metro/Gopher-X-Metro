import { Loader } from "@googlemaps/js-api-loader"
import React, { useEffect, useState } from 'react';

import Resources from 'src/backend/Resources.ts';

import Marker from './Marker.ts';
import Routes from './Routes.ts';
import LoadingScreen from "./LoadingScreen.tsx";
import SearchBar from "src/frontend/NavBar/components/SearchBar.ts";

/**
 * The map component
 */
export default function Map() {
    const [mapLoaded, setMapLoaded] = useState(false);

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

        // Creates the search bar
        SearchBar.init(map);

        // Loads the Route's Resources
        await Resources.load()

        // Sets the Routes map to this map
        Routes.init(map)

        // Initalizes the user's marker
        Marker.init(map);

        // Updates vehicle and marker postions every 0.5 seconds
        setInterval(() => {
            Routes.refreshVehicles();
            Marker.update();
        }, 500); // ms of wait

        // Updates stops every 30 seconds
        setInterval(() => {
            Routes.refreshStops();
        }, 30000); // ms of wait

    }

    useEffect(() => {
        // Minimum delay in milliseconds
        const minimumDelay = 2000;

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Initialize the map and wait for the minimum delay
        Promise.all([init(), delay(minimumDelay)]).then(() => {
            setMapLoaded(true);
        });
    }, []);


    return (<div className="h-[90%] w-full bg-black">
        <LoadingScreen hidden={mapLoaded}/>
        <input id="search-bar" className="controls" type="text"/>
        <div id="map"/> 
    </div>);
}