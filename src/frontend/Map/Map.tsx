import { Loader } from "@googlemaps/js-api-loader"
import React, { useEffect, useState } from 'react';

import Resources from 'src/backend/Resources.ts';

import Marker from './Marker.ts';
import Routes from './Routes.ts';
import LoadingScreen from "./LoadingScreen.tsx";
import SearchBar from "./elements/SearchBar.ts";

/**
 * The map component
 */
export default function Map() {
    let longpress: NodeJS.Timeout;
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

        if (isMobile()) {
            // Long press
            google.maps.event.addListener(map, "mousedown", event => longpress = setTimeout(() => onSelectLocation(event), 500));
            google.maps.event.addListener(map, "mouseup", () => clearTimeout(longpress));
            google.maps.event.addListener(map, "drag", () => clearTimeout(longpress));
        }
        else
            // Right click
            google.maps.event.addListener(map, "rightclick", event => onSelectLocation(event));

        // Creates the search bar
        SearchBar.init(map);

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


    return <div>
        <LoadingScreen hidden={mapLoaded}/>
        <input id="search-bar" className="controls" type="text"/>
        <div id="map"/> 
    </div>;
}

function isMobile() {
    return 'ontouchstart' in window;
}

function onSelectLocation(event) {
    var lat = event.latLng.lat();
    var lng = event.latLng.lng();
    // populate yor box/field with lat, lng
    alert("Lat=" + lat + "; Lng=" + lng);
}