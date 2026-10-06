import L from "leaflet";
import Static from "./Static.ts";

// Backend and Frontend interface
namespace Resources {
    /**
     * Load Backend
     */
    export async function load() {
        const initTime = Date.now();

        console.log("Loading Resources...")
        
        await Static.load();
        
        console.log("Finished Loading Resources (" + (Date.now() - initTime) + "ms)")
    }
    
    /**
     * Gets the shape ids of a route as an Array
     * @param routeId ID of the route
     */
    export async function getShapeIds(routeId: string) : Promise<Set<string>> {
        return new Set((await Static.getTrips(routeId))
        .filter((trip: { service_id: string; }) => Static.isServiceRunning(trip.service_id))
        .map((trip: { shape_id: any; }) => trip.shape_id));
    }

    /**
     * Gets the location of each point on a shape line as an Array
     * @param shapeId ID of the shape
     */
    export async function getShapeLocations(shapeId: string) : Promise<Array<L.LatLng>> {
        return (await Static.getShapes(shapeId)).map(([lat, lon]) => L.latLng(lat, lon));
    }
    
    /**
     * Gets the color of a route as a string
     * @param routeId ID of the route
     */
    export async function getColor(routeId: string) : Promise<string> {
        // Check if color is defined in ROUTE_COLORS
        if (ROUTE_COLORS[routeId]) return ROUTE_COLORS[routeId];
        // Cache the lookup itself: a route's shapes ask at the same time, and each must get the same color
        if (!colors.has(routeId)) colors.set(routeId, lookUpColor(routeId));
        return colors.get(routeId) as Promise<string>;
    }

    async function lookUpColor(routeId: string) : Promise<string> {
        try {
            const result = await Static.getRoutes(routeId);
            const gtfsColor = result?.[0]?.route_color;
            // Metro Transit gives whole groups of routes one color (every local bus is purple), which makes
            // routes shown together look alike, so those get their own color instead
            if (!result?.[0]) return "444444"; // unknown route, or its data didn't load
            return gtfsColor && !SHARED_GTFS_COLORS.has(gtfsColor.toUpperCase()) ? gtfsColor : distinctColor(routeId);
        } catch (e) {
            console.error(`Failed to fetch colors for routeId ${routeId}:`, e);
            return "444444";
        }
    }

    export function createInactiveRoutePopup() {
        const popup = document.createElement('div');
        popup.classList.add('inactive-route-popup');
      
        const closeButton = document.createElement('button');
        closeButton.textContent = 'x';
        closeButton.classList.add('close-button');
        closeButton.addEventListener('click', () => popup.remove());

        const content = document.createElement('p');
        content.innerText = `Sorry, this route is not active right now, please check the scheduling page for more information.`;
      
        popup.appendChild(closeButton);
        popup.appendChild(content);
        
      
        document.body.appendChild(popup);
      }

    /* Override Route Colors */
    const ROUTE_COLORS = {
        "120": "FFC0CB", 
        "121": "FF0000", 
        "122": "800080", 
        "123": "1ab7b7", 
        "124": "90EE90",
        "125": "c727e2",
        "126": "7a4a14",
        "FOOTBALL": "964B00",
        "2": "bab832",
        "3": "d18528",
        "6": "236918",
        "925": "236918",
        "902": "00843D",
        "901": "003DA5"
    };

    const colors = new Map<string, Promise<string>>();

    /* Route colors Metro Transit's GTFS shares across many routes (local, express, suburban, BRT) */
    const SHARED_GTFS_COLORS = new Set(["771473", "8AF3FF", "DFAACC", "8A8B8A"]);
    /* Colors for those routes: dark enough for white chip text (WCAG AA), and unlike the hand-picked ones above */
    const DISTINCT_PALETTE = ["771473", "C0392B", "00798C", "B34700", "30638E", "8E5572", "267349", "B5446E", "5B5F97", "8B5A2B", "1F7A8C", "A23B72"];
    const paletteUsed = new Set<string>();

    /**
     * Picks a palette color for a route, starting from one fixed by its ID and moving on from colors other routes already took
     * @param routeId ID of the route
     */
    function distinctColor(routeId: string) : string {
        let hash = 0;
        for (const char of routeId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
        let color = DISTINCT_PALETTE[hash % DISTINCT_PALETTE.length];
        for (let i = 0; i < DISTINCT_PALETTE.length && paletteUsed.has(color); i++)
            color = DISTINCT_PALETTE[(hash + i + 1) % DISTINCT_PALETTE.length];
        paletteUsed.add(color);
        return color;
    }
}

export default Resources;