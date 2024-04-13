import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

namespace Data {
    /* Public */

    /**
     * Loads the API
     */
    export async function load() : Promise<void> {        
        // Load calendar
        await fetch(API_URL + "/get-calendar?date="+date())
        .then(async response => (await response.json())
        .forEach((element: { service_id: string; }) => calendar.set(element.service_id, element)));
    }

    /* API */

    /**
     * Gets if the service is running today
     * @param serviceId the id of the service
     * @returns if its running
     */
    export function isServiceRunning(serviceId: string) : boolean {
        return getCalendar(serviceId) ? getCalendar(serviceId)[days[(new Date()).getDay()]] : false
    }
    /**
     * Gets the calendar of metro
     */
    export function getCalendar(serviceId: string) : any { 
        return calendar.get(serviceId); 
    }
    /**
     * Gets the stop data of a trip id
     * @param tripId ID of the trip
     */
    export async function getStops(tripId: string) : Promise<any> {
        if (!stops.has(tripId))
            // Load Stops
            await fetch(API_URL + "/get-stops?trip_id=" + tripId)
            .then(async response => stops.set(tripId, await response.json()));
        
        return stops.get(tripId);
    }
    /**
     * Gets the trips of a route
     * @param routeId ID of the route
     */
    export async function getTrips(routeId: string) : Promise<any> {
        if (!trips.has(routeId))
            // Load Trips
            await fetch(API_URL + "/get-trips?route_id=" + routeId + "&date=" + date())
            .then(async response => trips.set(routeId, await response.json()));

        console.log(trips.get(routeId))

        return trips.get(routeId)
    }
    /**
     * Gets the route data of a route
     * @param routeId ID of the route
     */
    export async function getRoutes(routeId: string) : Promise<any> {
        return await fetch(API_URL + "/get-routes?route_id=" + routeId)
        .then(async response => await response.json());
    }
    /**
     * Gets the shape data of a shapeId
     * @param shapeId ID of the shape
     */
    export async function getShapes(shapeId: string) : Promise<any> {
        if (!shapes.has(shapeId))
            await fetch(API_URL + "/get-shapes?shape_id=" + shapeId)
            .then(async response => shapes.set(shapeId, await response.json()));
        
        return shapes.get(shapeId); 
    }
    /**
     * Gets the stop_times data of a shapeId
     * @param tripId ID of the trip
     */
    export async function getStopTimes(tripId: string) : Promise<any> {
        if (!stop_times.has(tripId))
            await fetch(API_URL + "/get-stop-times?trip_id=" + tripId)
            .then(async response => stop_times.set(tripId, await response.json()));
        
        return stop_times.get(tripId); 
    }

    /**
     * Gets the fetched data of the university busses
     */
    export async function getRealtimeGTFSUniversity(): Promise<any> {
        const response = await fetch(GTFS_REALTIME_URL_UMN);

        // if (response.status === 404) {
        //     console.log(`Data fetching encountered status code 404 (Not Found) with University Data.`);
        //     throw new Error(`Data fetching encountered status code 404 (Not Found) with University Data`);
        // }

        // if (response.ok) {
            return response.json();
        // } else {
        //     const responseBodyText = await response.text(); // Get the response body as text
        //     console.log(`Data fetching encountered status code ${response.status} with University Data. Response Body: ${responseBodyText}`);
        //     throw new Error(`Data fetching encountered status code ${response.status} with University Data. Response Body: ${responseBodyText}`);
        // }

    }
    /**
     * Gets the fetched vehicle position data
     */
    export async function getRealtimeGTFSVehiclePositions() : Promise<GtfsRealtimeBindings.transit_realtime.FeedMessage> {
        return fetch(GTFS_REALTIME_URL_VEHICLE_POSITIONS).then(response => response?.arrayBuffer()).then(buffer => GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)))
    }
    /**
     * Gets the fetched trip updates data
     */
    export async function getRealtimeGTFSTripUpdates() : Promise<GtfsRealtimeBindings.transit_realtime.FeedMessage> {
        return fetch(GTFS_REALTIME_URL_TRIP_UPDATES).then(response => response?.arrayBuffer()).then(buffer => GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)))
    }

    /**
     * Gets the current date in format yyyymmdd
     */
    export function date() {
        var date = new Date(),
            month = '' + (date.getMonth() + 1),
            day = '' + date.getDate(),
            year = date.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return year+month+day
    }

    /* Private */
    const calendar : Map<string, any> = new Map<string, any>();
    const stops : Map<string, any> = new Map<string, any>();
    const trips : Map<string, any> = new Map<string, any>();    
    const shapes : Map<string, any> = new Map<string, any>();
    const stop_times : Map<string, any> = new Map<string, any>();


    
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

    //https://svc.metrotransit.org/index.html
    const API_URL = process.env.REACT_APP_SUPABASE_FUNCTION_URL
    const GTFS_REALTIME_URL_UMN = "https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&controller=vehicles2&action=list&agencyID=88";
    const GTFS_REALTIME_URL_VEHICLE_POSITIONS = 'https://svc.metrotransit.org/mtgtfs/vehiclepositions.pb';
    const GTFS_REALTIME_URL_TRIP_UPDATES = 'https://svc.metrotransit.org/mtgtfs/tripupdates.pb';
    const GTFS_REALTIME_URL_SERVICE_ALERTS = 'https://svc.metrotransit.org/mtgtfs/alerts.pb';
}

export default Data
