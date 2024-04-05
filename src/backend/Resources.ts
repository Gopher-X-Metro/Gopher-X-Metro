import Data from "./Data.ts";

// Backend and Frontend interface
namespace Resources {
    /**
     * Load Backend
     */
    export async function load() {
        const initTime = Date.now();

        console.log("Loading Resources...")
        
        await Data.load();
        
        console.log("Finished Loading Resources (" + (Date.now() - initTime) + "ms)")
    }
    /**
     * Gets the shape ids of a route as an Array
     * @param routeId ID of the route
     */
    export async function getShapeIds(routeId: string) : Promise<Array<string>> {
        return await fetch(API_URL + "/get-shape-ids?route_id=" + routeId)
        .then(async response => (await response.json())
        .map((element: { shape_id: any; }) => element.shape_id));
    }
    /**
     * Gets the trip ids of a route as a Set
     * @param routeId ID of the route
     */
    export async function getTripIds(routeId: string) : Promise<Array<string>> {
        return await fetch(API_URL + "/get-trip-ids?route_id=" + routeId)
        .then(async response => (await response.json())
        .map((element: { trip_id: any; }) => element.trip_id));
    }
    /**
     * Gets the stop ids of a trip as a Set
     * @param tripId ID of the trip
     */
    export function getStopIds(tripId: string) : Set<string> {
        let ids = new Set<string>();

        Data.getHash("stop_times.txt").get(tripId)?.forEach(line => ids.add(line.split(/,/)[3]) )

        return ids;
    }
    /**
     * Gets the location of each point on a shape line as an Array
     * @param shapeId ID of the shape
     */
    export async function getShapeLocations(shapeId: string) : Promise<Array<google.maps.LatLng>> {
        return await fetch(API_URL + "/get-shape?shape_id=" + shapeId)
        .then(response => response.json()
        .then(json => json.map((element: { shape_pt_lat: any, shape_pt_lon: any}) => new google.maps.LatLng(Number(element.shape_pt_lat), Number(element.shape_pt_lon)))))
    }
    /**
     * Gets the location of a stop id
     * @param stopId ID of the stop
     */
    export async function getStopLocations(stopIds: Array<string>) : Promise<google.maps.LatLng> {
        return await fetch(API_URL + "/get-stop?stop_id=" + stopIds)
        .then(async response => response.json())
        .then(result => new google.maps.LatLng(Number(result[0].shape_pt_lat), Number(result[0].shape_pt_lon)));
    }
    /**
     * Gets the stop times of a trip id as a map
     * @param tripId ID of the trip
     */
    export function getStopTimes(tripId: string) : Map<string, Array<string | undefined>> {
        let stopTimes = new Map<string, Array<string | undefined>>();

        Data.getHash("stop_times.txt").get(tripId)?.forEach(line => {
            let sections = line.split(/,/);
            stopTimes.set(sections[3], [sections[4], sections[1], sections[2]])
        })

        return stopTimes;
    }
    /**
     * Gets the color of a route as a string
     * @param routeId ID of the route
     */
    export async function getColor(routeId: string) : Promise<string> {
        let color = "";

        await fetch(API_URL + "/get-route?route_id=" + routeId)
        .then(response => response.json())
        .then(result => color = result.route_color)

        // It defaults to the colors manually defined. If the color is not defined, it defaults to the one if found. 
        return ROUTE_COLORS[routeId] ? ROUTE_COLORS[routeId] : color;
    }
    /* University Routes and ID */
    export const UNIVERSITY_ROUTES = {
        "120": 11324, 
        "121": 11278, 
        "122": 11279, 
        "123": 11280, 
        "124": 11281
    };
    /* Override Route Colors */
    const ROUTE_COLORS = {
        "120": "FFC0CB", 
        "121": "FF0000", 
        "122": "800080", 
        "123": "00FFFF", 
        "124": "90EE90",
        "2": "bab832",
        "3": "d18528",
        "6": "236918",
        "902": "00843D",
        "901": "003DA5"
    }

    const API_URL = process.env.REACT_APP_SUPABASE_FUNCTION_URL
}

export default Resources;