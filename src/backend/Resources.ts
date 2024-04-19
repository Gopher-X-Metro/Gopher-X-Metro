import Static from "./Static.ts";
import Realtime from "./Realtime.ts";

import busImage120 from "../img/120_bus.png"
import busImage121 from "../img/121_bus.png"
import busImage122 from "../img/122_bus.png"
import busImage123 from "../img/123_bus.png"
import busImage124 from "../img/124_bus.png"
import busImage2 from "../img/2_bus.png"
import busImage3 from "../img/3_bus.png"
import busImage6 from "../img/6_bus.png"
import busImage902 from "../img/902_greenline.png"
import busImage901 from "../img/901_blueline.png"

import arrowImage120 from "../img/120_arrow.png"
import arrowImage121 from "../img/121_arrow.png"
import arrowImage122 from "../img/122_arrow.png"
import arrowImage123 from "../img/123_arrow.png"
import arrowImage124 from "../img/124_arrow.png"
import arrowImage2 from "../img/2_arrow.png"
import arrowImage3 from "../img/3_arrow.png"
import arrowImage6 from "../img/6_arrow.png"
import arrowImage902 from "../img/902_greenline_arrow.png"
import arrowImage901 from "../img/901_blueline_arrow.png"

import busImage from "../img/bus.png"

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
     * Gets the running service ids of a route as an Array
     * @param routeId ID of the route
     */
    export async function getServiceIds(routeId: string) : Promise<Set<string>> {
        return new Set(await (await Static.getTrips(routeId))
        .filter((trip: { service_id: string; }) => Static.isServiceRunning(trip.service_id))
        .map((trip: { service_id: any; }) => trip.service_id));
    }
    /**
     * Gets the shape ids of a route as an Array
     * @param routeId ID of the route
     */
    export async function getShapeIds(routeId: string) : Promise<Set<string>> {
        return new Set(await (await Static.getTrips(routeId))
        .filter((trip: { service_id: string; }) => Static.isServiceRunning(trip.service_id))
        .map((trip: { shape_id: any; }) => trip.shape_id));
    }
    /**
     * Gets the trip ids of a route as a Set
     * @param routeId ID of the route
     */
    export async function getTripIds(routeId: string) : Promise<Set<string>> {
        return new Set(await (await Static.getTrips(routeId))
        .filter((trip: { service_id: string; }) => Static.isServiceRunning(trip.service_id))
        .map((trip: { trip_id: any; }) => trip.trip_id));
    }
    /**
     * Gets the location of each point on a shape line as an Array
     * @param shapeId ID of the shape
     */
    export async function getShapeLocations(shapeId: string) : Promise<Array<google.maps.LatLng>> {
        const shapeLocations = await (await Static.getShapes(shapeId))
        // Sorts to keep the order of the path
        .sort((a: { shape_dist_traveled: number; }, b: { shape_dist_traveled: number; }) => a.shape_dist_traveled - b.shape_dist_traveled)
        // Converts into locations
        .map((shape: {shape_pt_lat: any, shape_pt_lon: any}) => new google.maps.LatLng(Number(shape.shape_pt_lat), Number(shape.shape_pt_lon)))

        return shapeLocations
    }
    /**
     * Gets the stop IDs of a trip
     * @param routeId ID of the trip
     */
    export async function getStopsInfo(routeId: string) : Promise<Array<any>> {
        const stopsInfo = new Array<any>();
        
        for (const direction of (await Realtime.getDirections(routeId)))
            for (const stop of (await Realtime.getStops(routeId, direction.direction_id)))
                stopsInfo.push(await Realtime.getStopInfo(routeId, direction.direction_id, stop.place_code))

        return stopsInfo;
    }
    /**
     * Gets the color of a route as a string
     * @param routeId ID of the route
     */
    export async function getColor(routeId: string) : Promise<string> {
        // It defaults to the colors manually defined. If the color is not defined, it defaults to the one if found. 
        return ROUTE_COLORS[routeId] ? ROUTE_COLORS[routeId] : await Static.getRoutes(routeId).then(result => result[0].route_color !== "" ? result[0].route_color : "444444");
    }
    /**
     * Gets the color of a route as a string
     * @param routeId ID of the route
     */
    export function getRouteImages(routeId: string) : string[2] {
        // It defaults to the colors manually defined. If the color is not defined, it defaults to the one if found. 
        return ROUTE_IMAGES[routeId] ? ROUTE_IMAGES[routeId] : [busImage, ""];
    }
    

    /* University Routes and ID */
    export const UNIVERSITY_ROUTES = {
        "120": 11324, 
        "121": 11278, 
        "122": 11279, 
        "123": 11280, 
        "124": 11281
    };

    /* Override Bus Images */
    const ROUTE_IMAGES = {
        "120": [busImage120, arrowImage120], 
        "121": [busImage121, arrowImage121],
        "122": [busImage122, arrowImage122],
        "123": [busImage123, arrowImage123], 
        "124": [busImage124, arrowImage124],
        "2": [busImage2, arrowImage2],
        "3": [busImage3, arrowImage3],
        "6": [busImage6, arrowImage6],
        "902": [busImage902, arrowImage902],
        "901": [busImage901, arrowImage901]
    }

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
    
}

export default Resources;