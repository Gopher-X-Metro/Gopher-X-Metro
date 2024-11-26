import Static from "src/backend/Static";
import Realtime from "src/backend/Realtime";
import { IStop } from "src/backend/interface/StopInterface";
import { ITrip } from "src/backend/interface/TripInterface";
import { IShape } from "src/backend/interface/ShapeInterface";

import busImage120 from "src/img/120_bus.png";
import busImage121 from "src/img/121_bus.png";
import busImage122 from "src/img/122_bus.png";
import busImage123 from "src/img/123_bus.png";
import busImage124 from "src/img/124_bus.png";
import busImage125 from "src/img/125_bus.png";
import busImageFOOTBALL from "src/img/FOOTBALL_bus.png";
import busImage2 from "src/img/2_bus.png";
import busImage3 from "src/img/3_bus.png";
import busImage6 from "src/img/6_bus.png";
import busImage902 from "src/img/902_greenline.png";
import busImage901 from "src/img/901_blueline.png";

import arrowImage120 from "src/img/120_arrow.png";
import arrowImage121 from "src/img/121_arrow.png";
import arrowImage122 from "src/img/122_arrow.png";
import arrowImage123 from "src/img/123_arrow.png";
import arrowImage124 from "src/img/124_arrow.png";
import arrowImage125 from "src/img/125_arrow.png";
import arrowImageFOOTBALL from "src/img/FOOTBALL_arrow.png";
import arrowImage2 from "src/img/2_arrow.png";
import arrowImage3 from "src/img/3_arrow.png";
import arrowImage6 from "src/img/6_arrow.png";
import arrowImage902 from "src/img/902_greenline_arrow.png";
import arrowImage901 from "src/img/901_blueline_arrow.png";

import defaultBusImage from "src/img/default_bus.png";
import defaultArrowImage from "src/img/default_arrow.png";

// Backend and Frontend interface
namespace Resources {
    const colors = new Map<string, string>();

    /* Override Bus Images */
    const ROUTE_IMAGES = {
        "120": [busImage120, arrowImage120], 
        "121": [busImage121, arrowImage121],
        "122": [busImage122, arrowImage122],
        "123": [busImage123, arrowImage123], 
        "124": [busImage124, arrowImage124],
        "125": [busImage125, arrowImage125],
        "FOOTBALL": [busImageFOOTBALL, arrowImageFOOTBALL],
        "2": [busImage2, arrowImage2],
        "3": [busImage3, arrowImage3],
        "6": [busImage6, arrowImage6],
        "902": [busImage902, arrowImage902],
        "901": [busImage901, arrowImage901]
    };

    /* Override Route Colors */
    const ROUTE_COLORS = {
        "120": "FFC0CB", 
        "121": "FF0000", 
        "122": "800080", 
        "123": "1ab7b7", 
        "124": "90EE90",
        "125": "c727e2",
        "FOOTBALL": "964B00",
        "2": "bab832",
        "3": "d18528",
        "6": "236918",
        "902": "00843D",
        "901": "003DA5"
    };

    /**
     * Loads backend resources and static data.
     * Logs the total time taken for loading resources
     */
    export async function load() : Promise<void> {
        const initTime = Date.now();
        console.log("Loading Resources...");
        
        await Static.load();
        
        console.log("Finished Loading Resources (" + (Date.now() - initTime) + "ms)");
    }
    
    /**
     * Gets shape ids of a route as an Array
     * @param routeId ID of route
     * @returns set of shape IDs for the given route
     */
    export async function getShapeIds(routeId: string) : Promise<Set<string>> {
        return new Set((await Static.getTrips(routeId))
            .filter((trip: ITrip) => Static.isServiceRunning(trip.service_id))
            .map((trip: ITrip) => trip.shape_id)
        );
    }

    /**
     * Gets location of each point on a shape line as an Array.
     * Sorts to keep the order of the path and converts into locations
     * @param shapeId ID of shape
     * @returns array of shape locations
     */
    export async function getShapeLocations(shapeId: string) : Promise<Array<google.maps.LatLng>> {
        const shapeLocations = (await Static.getShapes(shapeId))
            .sort((a: IShape, b: IShape) => a.shape_dist_traveled - b.shape_dist_traveled)
            .map((shape: IShape) => new google.maps.LatLng(Number(shape.shape_pt_lat), Number(shape.shape_pt_lon)));

        return shapeLocations;
    }
    
    /**
     * Gets color of a route as a string
     * @param routeId ID of the route
     * @returns color of route as string
     */
    export async function getColor(routeId: string) : Promise<string> {
        try {
            // Check if color is defined in ROUTE_COLORS
            if (ROUTE_COLORS[routeId]) {
                return ROUTE_COLORS[routeId];
            }
    
            // Check existing colors
            if (colors.has(routeId)) {
                return colors.get(routeId) as string;
            }

            // Fetch route color from Static.getRoutes
            const result = await Static.getRoute(routeId);
            if (result && result[0] && result[0].route_color && result[0].route_color !== "") {
                colors.set(routeId, result[0].route_color);
                return result[0].route_color;
            }
        } catch (e) {
            console.error(`Failed to fetch colors for routeId ${routeId}:`, e);  
        }

        // Default color if no valid route color found
        colors.set(routeId, "444444");
        return "444444";
    }

    /**
     * Gets bus and arrow images for a route.
     * It defaults to the colors manually defined. 
     * If the color is not defined, it defaults to the one if found. 
     * @param routeId ID of route
     * @returns array with bus image and arrow image URLs
     */
    export function getRouteImages(routeId: string) : string[2] {
        return ROUTE_IMAGES[routeId] ? ROUTE_IMAGES[routeId] : [defaultBusImage, defaultArrowImage];
    }

    /**
     * Creates and displays inactive route popup
     */
    export function createInactiveRoutePopup() : void {
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

    /* Depreciated / Unused */

    /**
     * Gets the trip IDs of a route as a Set
     * @param routeId ID of route
     * @returns set of trip IDs
     * @deprecated
     */
    async function getTripIds(routeId: string) : Promise<Set<string>> {
        return new Set((await Static.getTrips(routeId))
            .filter((trip: ITrip) => Static.isServiceRunning(trip.service_id))
            .map((trip: ITrip) => trip.trip_id)
        );
    }

    /**
     * Gets running service IDs of a route as an Array
     * @param routeId ID of route
     * @returns set of running service IDs
     * @deprecated
     */
    async function getServiceIds(routeId: string) : Promise<Set<string>> {
        return new Set((await Static.getTrips(routeId))
            .filter((trip: ITrip) => Static.isServiceRunning(trip.service_id))
            .map((trip: ITrip) => trip.service_id)
        );
    }

    /**
     * Gets stop IDs of a trip
     * @param routeId ID of trip
     * @returns array of stop information
     * @deprecated
     */
    async function getStopsInfo(routeId: string) : Promise<Array<IStop> | null> {
        const stopsInfo: Array<IStop> = [];

        const directions = await Realtime.getDirections(routeId);

        // If there are no directions, return null
        if (!Array.isArray(directions) || !directions.length) {
            return null;
        }
        
        for (const direction of directions) {
            for (const stop of (await Realtime.getStops(routeId, direction.direction_id))) {
                stopsInfo.push(await Realtime.getStopInfo(routeId, direction.direction_id, stop.place_code));
            }
        }

        return stopsInfo;
    }
}

export default Resources;