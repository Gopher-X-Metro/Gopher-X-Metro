import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import Peak from "src/backend/Peak.ts";

namespace Realtime {
    /**
     * Gets the running routes
     * @returns list of routes data
     */
    export async function getRoutes() : Promise<Array<any>> {
        return await (await fetch("https://svc.metrotransit.org/nextrip/routes")).json();
    }
    /**
     * Gets the specific route if its running
     * @param routeId the route ID
     * @returns route data
     */
    export async function getRoute(routeId: string) : Promise<any> {
        for (const route of await getRoutes())
            if (route.route_id === routeId) 
                return route;
    }
    /**
     * Gets the data of the specific stop
     * @param stopId the stop ID
     * @returns the stop data
     */
    export async function getStop(stopId: string) : Promise<any> {
        return await (await fetch("https://svc.metrotransit.org/nextrip/"+stopId)).json()
    }
    /**
     * Gets the current vehicles running on the route
     * @param routeId the route ID
     * @returns a list of vehicle data
     */
    export async function getVehicles(routeId: string) : Promise<any> {
        
        // Check if University Route
        if (Object.keys(Peak.UNIVERSITY_ROUTES).includes(routeId)) {
            let json = (await getRealtimeGTFSUniversity()).vehicles
            .filter(vehicle => Peak.UNIVERSITY_ROUTES[routeId] === vehicle.routeID);

            json.forEach(vehicle => {
                vehicle.trip_id = vehicle.tripID;
                vehicle.latitude = vehicle.lat;
                vehicle.longitude = vehicle.lng;
                vehicle.timestamp = vehicle.positionUpdated;
                vehicle.bearing = vehicle.linkBearing;
            })

            return json;
        }

        // Check if the route exists in Transit
        if (!(await getRoute(routeId))) return 

        // Run on Metro Routes
        return await fetch("https://svc.metrotransit.org/nextrip/vehicles/"+routeId).then(async response => {
            if (response.ok && response.status === 200){
                let json = await response.json();

                json.forEach(vehicle => {
                    vehicle.timestamp = vehicle.location_time;
                })
            
                return json;
            } else
                console.warn(`Data fetching encountered status code ${response.status} with Metro Vehicles`);
        })
    }
    /**
     * Gets the stops that are in the route in the specified direction
     * @param routeId the route ID
     * @param directionId the direction ID
     * @returns a list of stops
     */
    export async function getStops(routeId: string, directionId: number) : Promise<Array<any>> {
        return await (await fetch("https://svc.metrotransit.org/nextrip/stops/"+routeId+"/"+directionId)).json()
    }
    /**
     * Gets the information about the specified stop on the route in the specified direction
     * @param routeId the route ID
     * @param directionId the direction ID
     * @param placeCode the place code of the stop
     * @returns the description of the stop
     */
    export async function getStopInfo(routeId: string, directionId: number, placeCode: string) : Promise<Array<any>> {
        return await (await fetch("https://svc.metrotransit.org/nextrip/"+routeId+"/"+directionId+"/"+placeCode)).json()
    }
    /**
     * Gets the directions that vehicles are currently running
     * @param routeId the route ID
     * @returns the direcitons data
     */
    export async function getDirections(routeId: string) : Promise<Array<any>> {
        return await (await fetch("https://svc.metrotransit.org/nextrip/directions/"+routeId)).json()
    }
    /**
     * Gets the fetched data of the university busses
     */
    export async function getRealtimeGTFSUniversity(): Promise<any> {
        return await fetch(GTFS_REALTIME_URL_UMN).then(async response => {
            if (response.ok && response.status === 200)
                return await response.json();
            else
                console.warn(`Data fetching encountered status code ${response.status} with University Data. Response Body: ${await response.text()}`);
        })
    }

    const GTFS_REALTIME_URL_UMN = "https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&controller=vehicles2&action=list&agencyID=88";
    const GTFS_REALTIME_URL_VEHICLE_POSITIONS = 'https://svc.metrotransit.org/mtgtfs/vehiclepositions.pb';
    const GTFS_REALTIME_URL_TRIP_UPDATES = 'https://svc.metrotransit.org/mtgtfs/tripupdates.pb';
    const GTFS_REALTIME_URL_SERVICE_ALERTS = 'https://svc.metrotransit.org/mtgtfs/alerts.pb';

    /* Depreciated */
    
    /**
     * Gets the fetched vehicle position data
     * @depreciated
     */
    export async function getRealtimeGTFSVehiclePositions() : Promise<GtfsRealtimeBindings.transit_realtime.FeedMessage> {
        const response = await fetch(GTFS_REALTIME_URL_VEHICLE_POSITIONS);

        return response?.arrayBuffer().then(buffer => GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)))
    }
    /**
     * Gets the fetched trip updates data
     */
    export async function getRealtimeGTFSTripUpdates() : Promise<GtfsRealtimeBindings.transit_realtime.FeedMessage | undefined> {
        return await fetch(GTFS_REALTIME_URL_TRIP_UPDATES).then(async response => {
            if (response.ok && response.status === 200)
                return await response.arrayBuffer().then(buffer => GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)))
            else
                console.warn(`Data fetching encountered status code ${response.status} with Trip Updates.`);
        })
    }


}

export default Realtime;