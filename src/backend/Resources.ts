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
     * Gets the running service ids of a route as an Array
     * @param routeId ID of the route
     */
    export async function getServiceIds(routeId: string) : Promise<Set<string>> {
        return new Set(await (await Data.getTrips(routeId))
        .filter((trip: { service_id: string; }) => Data.isServiceRunning(trip.service_id))
        .map((trip: { service_id: any; }) => trip.service_id));
    }
    /**
     * Gets the shape ids of a route as an Array
     * @param routeId ID of the route
     */
    export async function getShapeIds(routeId: string) : Promise<Set<string>> {
        return new Set(await (await Data.getTrips(routeId))
        .filter((trip: { service_id: string; }) => Data.isServiceRunning(trip.service_id))
        .map((trip: { shape_id: any; }) => trip.shape_id));
    }
    /**
     * Gets the trip ids of a route as a Set
     * @param routeId ID of the route
     */
    export async function getTripIds(routeId: string) : Promise<Set<string>> {
        return new Set(await (await Data.getTrips(routeId))
        .filter((trip: { service_id: string; }) => Data.isServiceRunning(trip.service_id))
        .map((trip: { trip_id: any; }) => trip.trip_id));
    }
    /**
     * Gets the location of each point on a shape line as an Array
     * @param shapeId ID of the shape
     */
    export async function getShapeLocations(shapeId: string) : Promise<Array<google.maps.LatLng>> {
        const shapeLocations = await (await Data.getShapes(shapeId))
        // Sorts to keep the order of the path
        .sort((a: { shape_dist_traveled: number; }, b: { shape_dist_traveled: number; }) => a.shape_dist_traveled - b.shape_dist_traveled)
        // Converts into locations
        .map((shape: {shape_pt_lat: any, shape_pt_lon: any}) => new google.maps.LatLng(Number(shape.shape_pt_lat), Number(shape.shape_pt_lon)))

        return shapeLocations
    }
    /**
     * Gets the stop IDs of a trip
     * @param tripId ID of the trip
     */
    export async function getStopIds(tripId: string) : Promise<Set<number>> {
        return new Set(await (await Data.getStops(tripId))
        .map((stop: { stop_id: any; }) => stop.stop_id));
    }
    /**
     * Gets the color of a route as a string
     * @param routeId ID of the route
     */
    export async function getColor(routeId: string) : Promise<string> {
        // It defaults to the colors manually defined. If the color is not defined, it defaults to the one if found. 
        return ROUTE_COLORS[routeId] ? ROUTE_COLORS[routeId] : await Data.getRoutes(routeId).then(result => result.route_color);
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
    };

    const API_URL = process.env.REACT_APP_SUPABASE_FUNCTION_URL
}

export default Resources;