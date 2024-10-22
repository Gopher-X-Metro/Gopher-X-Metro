import { ICalendar } from "src/backend/interface/CalendarInterface";
import { IRoute } from "src/backend/interface/RouteInterface";
import { IShape } from "src/backend/interface/ShapeInterface";
import { IStop, IStopTimes } from "src/backend/interface/StopInterface";
import { ITrip } from "src/backend/interface/TripInterface";

namespace Static {
    const calendar : Map<string, ICalendar> = new Map();
    const stops : Map<string, IStop[]> = new Map();
    const trips : Map<string, ITrip[]> = new Map();    
    const shapes : Map<string, IShape> = new Map();
    const stop_times : Map<string,IStopTimes[]> = new Map();
    
    /* Days of the week */
    const days = [
        "sunday", 
        "monday", 
        "tuesday", 
        "wednesday", 
        "thursday", 
        "friday", 
        "saturday"
    ];

    /* API base URL */
    const API_URL = process.env.REACT_APP_SUPABASE_FUNCTION_URL as string;

    /**
     * Loads calendar data from API and stores it in calendar map
     */
    export async function load() : Promise<void> {        
        // Load calendar
        await fetch(`${API_URL}/get-calendar?date=${date()}`)
        .then(async response => (await response.json())
        .forEach((element: ICalendar) => calendar.set(element.service_id, element)));
    }

    /**
     * Checks if service is running today based on service ID
     * @param serviceId id of service
     * @returns True if service is running, false otherwise
     */
    export function isServiceRunning(serviceId: string) : boolean {
        const service = getCalendar(serviceId);
        return service ? service[days[(new Date()).getDay()]] : false;
    }

    /**
     * Gets trip data for a specific route ID
     * @param routeId ID of route
     * @returns array of trip data
     */
    export async function getTrips(routeId: string) : Promise<ITrip[]> {
        if (!trips.has(routeId)) {
            // Load Trips
            await fetch(`${API_URL}/get-trips?route_id=${routeId}`)
            .then(async response => trips.set(routeId, await response.json()));
        }

        const trip = trips.get(routeId);
        if (!trip) {
            throw new Error(`Trip data not found for routeId: ${routeId}`);
        }

        return trip;
    }

    /**
     * Gets route data for a specific route ID
     * @param routeId ID of route
     * @returns route data
     */
    export async function getRoute(routeId: string) : Promise<IRoute> {
        return await fetch(`${API_URL}/get-routes?route_id=${routeId}`)
        .then(async response => await response.json());
    }

    /**
     * Gets shape data for a specific shape ID
     * @param shapeId ID of shape
     * @returns array of shape data
     */
    export async function getShapes(shapeId: string) : Promise<IShape[]> {
        if (!shapes.has(shapeId)) {
            await fetch(`${API_URL}/get-shapes?shape_id=${shapeId}`)
            .then(async response => shapes.set(shapeId, await response.json()));
        }
        
        const shape = shapes.get(shapeId);
        if (!shape || !Array.isArray(shape)) {
            throw new Error(`Shape data not found for shapeId: ${shapeId}`);
        }
        
        return shape;
    }

    /* Private Helper Methods */

    /**
     * Gets calendar entry for a specific service ID
     * @param serviceId ID of service
     * @returns calendar entry or undefined if not found
     */
    function getCalendar(serviceId: string) : ICalendar | undefined { 
        return calendar.get(serviceId); 
    }

    /**
     * Gets current date in format 'yyyymmdd'
     * @returns string representing current date
     */
    function date() : string {
        const date = new Date();
        let month = (date.getMonth() + 1).toString().padStart(2, "0");
        let day = date.getDate().toString().padStart(2, "0");
        const year = date.getFullYear();

        return `${year}${month}${day}`;
    }

    /* Depreciated / Unused */

    /**
     * Gets stop data for a specific trip ID
     * @param tripId ID of trip
     * @returns array of stop data
     */
    async function getStops(tripId: string) : Promise<IStop[]> {
        if (!stops.has(tripId)) {
            // Load Stops
            await fetch(`${API_URL}/get-stops?trip_id=${tripId}`)
            .then(async response => stops.set(tripId, await response.json()));
        }
        
        const stop = stops.get(tripId);
        if (!stop) {
            throw new Error(`Stop data not found for tripId: ${tripId}`);
        }

        return stop;
    }

    /**
     * Gets stop times data for a specific trip ID
     * @param tripId ID of trip
     * @returns array of stop times data
     */
    async function getStopTimes(tripId: string) : Promise<IStopTimes[]> {
        if (!stop_times.has(tripId)) {
            await fetch(`${API_URL}/get-stop-times?trip_id=${tripId}`)
            .then(async response => stop_times.set(tripId, await response.json()));
        }

        const stop_time = stop_times.get(tripId);
        if (!stop_time) {
            throw new Error(`Stop Times data not found for tripID: ${tripId}`);
        }
        
        return stop_time;
    }
}

export default Static;