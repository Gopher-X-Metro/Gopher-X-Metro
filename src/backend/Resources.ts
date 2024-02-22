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
     * Gets the shape ids of a route as a Set
     * @param routeId ID of the route
     */
    export function getShapeIds(routeId: string) : Set<string> {
        let ids = new Set<string>();

        Data.getHash("trips.txt").get(routeId)?.forEach(line => ids.add(line.split(/,/)[7]))

        return ids;
    }
    /**
     * Gets the trip ids of a route as a Set
     * @param routeId ID of the route
     */
    export function getTripIds(routeId: string) : Set<string> {
        let ids = new Set<string>();

        Data.getHash("trips.txt").get(routeId)?.forEach(line => ids.add(line.split(/,/)[2]))
        
        return ids;
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
    export function getShapeLocations(shapeId: string) : Array<google.maps.LatLng> {
        let shape = new Array<google.maps.LatLng>();

        Data.getHash("shapes.txt").get(shapeId)?.forEach(line =>{
            const sections = line.split(/,/);
            shape.push(new google.maps.LatLng(Number(sections[1]), Number(sections[2])))
        })

        return shape;
    }
    /**
     * Gets the location of a stop id
     * @param stopId ID of the stop
     */
    export function getStopLocation(stopId: string) : google.maps.LatLng {
        let stop : google.maps.LatLng;

        Data.getHash("stops.txt").get(stopId)?.forEach(line => {
            const sections = line.split(/,/);
            stop = new google.maps.LatLng(Number(sections[4]), Number(sections[5]))
        })

        //@ts-ignore
        return stop;
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
    export function getColor(routeId: string) : string {
        let color = "";

        Data.getHash("routes.txt").get(routeId)?.forEach(line => color += line.split(/,/)[7]);
        
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
}

export default Resources;