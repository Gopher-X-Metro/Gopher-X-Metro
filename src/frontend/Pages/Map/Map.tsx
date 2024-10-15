import { Map, useMap } from "@vis.gl/react-google-maps";

import { useState } from "react";

import Resources from "src/backend/Resources";
import Marker from "./components/Marker";
import Routes from "./components/Routes";
// import SearchBar from "src/frontend/NavBar/components/SearchBar";
import SearchBar from "src/frontend/NavBar/components/SearchBar.tsx"

import LoadingScreen from "./components/LoadingScreen";
import NavBar from "src/frontend/NavBar/NavBar";

const APIKey = process.env.REACT_APP_API_KEY; // Comes from the .env.local file, just for security. Won't appear in main -- all api keys should be added to Vercel console. 
const UMNLocation = { lat: 44.97369560732433, lng: -93.2317259515601 };
const defaultZoom = 15;

if (!APIKey) throw new Error("API Key was not loaded, or was not found!"); 

export default function MapPage({ hidden, setPage, isMobile }) {
    const [mapLoaded, setMapLoaded] = useState(false);
    const map = useMap("map");

    // Initalizes Map Component
    if (map) {
        const minimumDelay = 2000;

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Initialize the map and wait for the minimum delay
        Promise.all([initalize(map), delay(minimumDelay)]).then(() => setMapLoaded(true));
    }

    return (
    <>
        <div className="h-[100%] w-full bg-black" hidden={hidden}>
            <NavBar setPage={setPage} isMobile={isMobile}/>
            <LoadingScreen hidden={mapLoaded}/>
            <Map
                id="map"
                className="map"
                mapId={process.env.REACT_APP_MAP_ID}
                defaultCenter={UMNLocation}
                defaultZoom={defaultZoom}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
                streetViewControl={false}
                fullscreenControl={false}
                mapTypeControl={false}
            > 
                <SearchBar isMobile={isMobile}/>
            </Map>
        </div>
    </>);
}

async function initalize( map: google.maps.Map ) {

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