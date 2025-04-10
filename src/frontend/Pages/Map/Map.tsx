import { Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

import Service from "src/frontend/Pages/Map/components/Service"

import Resources from "src/backend/Resources";
import Marker from "src/frontend/Pages/Map/components/Marker";
import Routes from "src/frontend/Pages/Map/components/Routes";
import LoadingScreen from "src/frontend/Pages/Map/components/LoadingScreen";
import NavBar from "src/frontend/NavBar/NavBar";
import CenterButton from "src/frontend/NavBar/components/CenterButton";
import LocationSearchBar from "src/frontend/NavBar/components/LocationSearchBar";

const APIKey = process.env.REACT_APP_API_KEY; // Comes from the .env.local file, just for security. Won't appear in main -- all api keys should be added to Vercel console. 
const UMNLocation = { lat: 44.97369560732433, lng: -93.2317259515601 };
const defaultZoom = 15;

if (!APIKey) throw new Error("API Key was not loaded, or was not found!");

/**
 * Map Page
 * @param hidden if map should be hidden
 * @param setPage callback to change current page
 * @param isMobile if user is on mobile or not
 * @returns rendered Map Page
 */
export default function MapPage({ hidden, setPage, isMobile }) {
    const [mapLoaded, setMapLoaded] = useState(false);
    const map = useMap("map");

    useEffect(() => {
        // Initalizes Map Component when map is ready
        if (map) {
            // min delay for smooth loading experience
            const minimumDelay = 2000;

            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

            // Initialize map and wait for the minimum delay
            Promise.all([initalize(map), delay(minimumDelay)]).then(() => setMapLoaded(true));
        }
    }, [map]);

    return (
        <>
            <div className="h-[100%] w-full bg-black" hidden={hidden}>
                <NavBar setPage={setPage} isMobile={isMobile} />
                <LoadingScreen hidden={mapLoaded} />
                <Map
                    id="map"
                    className="map"
                    mapId={process.env.REACT_APP_MAP_ID}
                    defaultCenter={UMNLocation}
                    defaultZoom={defaultZoom}
                    gestureHandling={"greedy"}
                    disableDefaultUI={true}
                    zoomControl={true}
                    streetViewControl={false}
                    fullscreenControl={false}
                    mapTypeControl={false}
                >
                    <LocationSearchBar isMobile={isMobile} />
                    <CenterButton />
                </Map>
            </div>
        </>
    );
}

/** Focus the map at a the UMN */
export function centerMap(map: google.maps.Map | null): void
/** Focus the map at a specified location */
export function centerMap(map: google.maps.Map | null, location: { lat: number, lng: number } | google.maps.LatLng): void
/** Focus the map at a specific location and zoom */
export function centerMap(map: google.maps.Map | null, location: { lat: number, lng: number } | google.maps.LatLng, zoom: number): void
export function centerMap(map: google.maps.Map | null, location?: { lat: number, lng: number } | google.maps.LatLng, zoom?: number): void {
    if (map !== null) {
        map.setZoom((zoom === undefined) ? defaultZoom : zoom);
        map.panTo((location === undefined) ? UMNLocation : location);
    }
}

/**
 * Initializes map with routes, markers, and periodic updates for vehicle positions
 * 
 * @param map Google Maps instance to initialize
 */
async function initalize(map: google.maps.Map): Promise<void> {
    // Loads the Route's Resources
    await Resources.load();

    // Sets Routes map to this map
    Routes.init(map);

    // Initalizes user's marker
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

    Service.link(map);
    Service.instance.run();
}