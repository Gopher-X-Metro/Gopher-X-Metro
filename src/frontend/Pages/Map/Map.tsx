import { Loader } from "@googlemaps/js-api-loader"
import { useState, useEffect } from "react";

import Resources from "src/backend/Resources";
import Marker from "./components/Marker";
import Routes from "./components/Routes";
import SearchBar from "src/frontend/NavBar/components/SearchBar";

import LoadingScreen from "./components/LoadingScreen";
import NavBar from "src/frontend/NavBar/NavBar";

const APIKey = process.env.REACT_APP_API_KEY; // Comes from the .env.local file, just for security. Won't appear in main -- all api keys should be added to Vercel console. 
const UMNLocation = { lat: 44.97369560732433, lng: -93.2317259515601 };
const defaultZoom = 15;

if (!APIKey) throw new Error("API Key was not loaded, or was not found!"); 

const googleMapsLoader = new Loader({
    apiKey: APIKey,
    version: "weekly",
    libraries: ["places", "geometry", "marker"]
}); 

export default function Map() {
    const [mapLoaded, setMapLoaded] = useState(false);
    
    // Initalizes Map Component
    useEffect(() => {
        const minimumDelay = 2000;

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Initialize the map and wait for the minimum delay
        Promise.all([initalize(), delay(minimumDelay)]).then(() => {
            setMapLoaded(true);
        });
    }, [])

    return (
    <>
        <NavBar/>
        <div className="h-[90%] w-full bg-black">
            <LoadingScreen hidden={mapLoaded}/>
            <input id="search-bar" className="controls" type="text"/>
            <div id="map"/> 
        </div>
    </>);
}

async function initalize() {
    // Load map object
    const map = await googleMapsLoader.importLibrary("maps")
    .then(({Map}) => 
        new Map(document.getElementById("map") as HTMLElement, {
            center: UMNLocation,
            zoom: defaultZoom,
            mapId: process.env.REACT_APP_MAP_ID
        })
    )

    // Loads the Route's Resources
    await Resources.load()
    // Creates the search bar
    SearchBar.init(map);
    // Sets the Routes map to this map
    Routes.init(map)
    // Initalizes the user's marker
    Marker.init(map);

    // Updates vehicle and marker postions every 10 seconds
    setInterval(() => {
        Routes.refreshVehicles();
        Marker.update();
    }, 10000); // ms of wait

    // Updates stops every 30 seconds
    setInterval(() => {
        Routes.refreshStops();
    }, 30000); // ms of wait
}