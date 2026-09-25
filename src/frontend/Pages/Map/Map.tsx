import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useEffect, useRef, useState } from "react";

import Resources from "src/backend/Resources";
import Marker from "./components/Marker";
import Routes from "./components/Routes";
import URL from "src/backend/URL";

import LoadingScreen from "./components/LoadingScreen";
import NavBar from "src/frontend/NavBar/NavBar";
import CenterButton from "src/frontend/NavBar/components/CenterButton";
import LocationSearchBar from "src/frontend/NavBar/components/LocationSearchBar";
import NearbyPanel from "./components/NearbyPanel";
import AlertBanner from "./components/AlertBanner";

const UMNLocation = { lat: 44.97369560732433, lng: -93.2317259515601 };
const defaultZoom = 15;
// Every Metro Transit stop, with a little margin
const TWIN_CITIES = L.latLngBounds([44.66, -93.80], [45.38, -92.74]);

let currentMap: L.Map | null = null;

/** The map shown on the page, for controls outside it */
export function getMap() : L.Map | null { return currentMap; }

export default function MapPage({ hidden, setPage, isMobile }) {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [map, setMap] = useState<L.Map | null>(null);
    const mapDiv = useRef<HTMLDivElement>(null);
    const page = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // The header's height scales with the window, so map controls are placed below its measured bottom
        const header = page.current?.querySelector(".chakra-stack") as HTMLElement | null;
        if (!header || !page.current) return;
        const update = () => page.current?.style.setProperty("--header-h", header.getBoundingClientRect().bottom + "px");
        const observer = new ResizeObserver(update);
        observer.observe(header);
        update();
        return () => observer.disconnect();
    }, [])

    useEffect(() => {
        // Creates the Leaflet map once the container exists
        if (mapDiv.current && !map) {
            const leafletMap = L.map(mapDiv.current, {
                zoomControl: false,
                // Keeps the map on the Twin Cities metro, where these routes run
                maxBounds: TWIN_CITIES,
                maxBoundsViscosity: 1,
                minZoom: 10,
            }).setView(UMNLocation, defaultZoom);
            L.control.zoom({ position: "bottomright" }).addTo(leafletMap);
            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(leafletMap);
            setMap(leafletMap);
            currentMap = leafletMap;
        }
    }, [map])

    useEffect(() => {
        // The map's size is unknown while the page is hidden
        if (map && !hidden) map.invalidateSize();
    }, [map, hidden])

    useEffect(() => {
        // Initalizes Map Component
        if (map) {
            const minimumDelay = 2000;

            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            // Initialize the map and wait for the minimum delay
            Promise.all([initalize(map), delay(minimumDelay)]).then(() => setMapLoaded(true));
        }
    }, [map])

    return (
    <>
        <div ref={page} className="h-[100%] w-full bg-black" hidden={hidden}>
            <NavBar setPage={setPage} isMobile={isMobile}/>
            <LoadingScreen hidden={mapLoaded}/>
            <div className="map relative h-full w-full">
                <div ref={mapDiv} className="h-full w-full z-0"/>
                <LocationSearchBar map={map} isMobile={isMobile}/>
                <CenterButton map={map}/>
                <AlertBanner/>
                <NearbyPanel map={map} isMobile={isMobile}/>
            </div>
        </div>
    </>);
}

/** Focus the map at a the UMN */
export function centerMap(map: L.Map | null) : void
/** Focus the map at a specified location */
export function centerMap(map: L.Map | null, location: {lat: number, lng: number} | L.LatLng) : void
/** Focus the map at a specific location and zoom */
export function centerMap(map: L.Map | null, location: {lat: number, lng: number} | L.LatLng, zoom: number) : void
export function centerMap(map: L.Map | null, location?: {lat: number, lng: number} | L.LatLng, zoom?: number) : void {
    if (map !== null) {
        map.setView((location === undefined) ? UMNLocation : location, (zoom === undefined) ? defaultZoom : zoom);
    }
}

async function initalize( map: L.Map ) {
    // Loads the Route's Resources
    await Resources.load()
    // Sets the Routes map to this map
    Routes.init(map)
    // Initalizes the user's marker
    // A link to routes away from campus (like ?route=777) opens looking at them, even after centering on the rider
    const showLinkedRoutes = () => Routes.showRoute(...Array.from(URL.getRoutes()));
    Marker.init(map, showLinkedRoutes);
    showLinkedRoutes();

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