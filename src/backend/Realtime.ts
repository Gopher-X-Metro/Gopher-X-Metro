import { getCachedJSON, getJSON } from "src/backend/Fetch.ts";
import Peak from "src/backend/Peak.ts";

namespace Realtime {
    /**
     * Gets the running routes
     * @returns list of routes data
     */
    export async function getRoutes() : Promise<Array<any>> {
        return await getCachedJSON("https://svc.metrotransit.org/nextrip/routes", 10 * 60 * 1000);
    }
    /**
     * Gets the specific route if its running
     * @param routeId the route ID
     * @returns route data
     */
    export async function getRoute(routeId: string) : Promise<any> {
        for (const route of (await getRoutes()) ?? [])
            if (route.route_id === routeId) 
                return route;
    }
    /**
     * Gets the data of the specific stop
     * @param stopId the stop ID
     * @returns the stop data
     */
    export async function getStop(stopId: string) : Promise<any> {
        return await getCachedJSON("https://svc.metrotransit.org/nextrip/"+stopId, 10000)
    }
    /**
     * Gets the current vehicles running on the route
     * @param routeId the route ID
     * @returns a list of vehicle data
     */
    export async function getVehicles(routeId: string) : Promise<any> {
        
        // Check if University Route
        if (Object.keys(Peak.UNIVERSITY_ROUTES).includes(routeId)) {
            let json = ((await getRealtimeGTFSUniversity())?.vehicles ?? [])
            .filter(vehicle => Peak.UNIVERSITY_ROUTES[routeId] === vehicle.routeID || Peak.NIGHT_ROUTES[routeId] === vehicle.routeID)
            // Buses without a trip are parked or heading to the garage, not carrying riders
            .filter(vehicle => vehicle.tripID && !vehicle.hidden && !atGarage(vehicle.lat, vehicle.lng));

            json.forEach(vehicle => {
                // Keyed by bus, since trip IDs aren't unique between campus buses
                vehicle.trip_id = "peak-" + vehicle.vehicleID;
                vehicle.latitude = vehicle.lat;
                vehicle.longitude = vehicle.lng;
                vehicle.timestamp = vehicle.positionUpdated;
                vehicle.bearing = vehicle.linkBearing;
            })

            return json;
        }

        // Check if the route exists in Transit
        if (!(await getRoute(routeId))) return 

        // Run on Metro Routes; Metro Transit only refreshes positions every ~30 seconds, so poll every 5
        const cached = metroVehicles.get(routeId);
        if (cached && Date.now() - cached.time < METRO_POLL_MS) return cached.data;
        const request = fetchMetroVehicles(routeId);
        metroVehicles.set(routeId, { time: Date.now(), data: request });
        return request;
    }
    async function fetchMetroVehicles(routeId: string) : Promise<any> {
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
     * Gets the fetched data of the university busses
     */
    export async function getRealtimeGTFSUniversity(): Promise<any> {
        // One shared request for every campus route; Peak positions refresh every few seconds
        if (!universityRequest || Date.now() - universityTime > PEAK_POLL_MS) {
            universityTime = Date.now();
            universityRequest = fetchUniversity().catch(() => undefined);
        }
        return universityRequest;
    }
    async function fetchUniversity(): Promise<any> {
        return await fetch(GTFS_REALTIME_URL_UMN).then(async response => {
            if (response.ok && response.status === 200)
                return await response.json();
            else
                console.warn(`Data fetching encountered status code ${response.status} with University Data. Response Body: ${await response.text()}`);
        })
    }

    // The campus bus garage off SE Como Ave and 30th Ave SE, where buses sit overnight
    const GARAGE = { south: 44.9846, north: 44.9905, west: -93.2155, east: -93.2068 };

    /** If a position is inside the campus bus garage */
    function atGarage(lat: number, lng: number) : boolean {
        return lat >= GARAGE.south && lat <= GARAGE.north && lng >= GARAGE.west && lng <= GARAGE.east;
    }

    const PEAK_POLL_MS = 2000;
    const METRO_POLL_MS = 5000;
    let universityRequest: Promise<any> | undefined;
    let universityTime = 0;
    const metroVehicles = new Map<string, { time: number, data: Promise<any> }>();

    const GTFS_REALTIME_URL_UMN = "https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&controller=vehicles2&action=list&agencyID=88";


}

export default Realtime;