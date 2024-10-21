import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import Peak from "src/backend/Peak.ts";
import { IRoute } from "src/backend/interface/RouteInterface";
import { IStop } from "src/backend/interface/StopInterface";
import { IVehicle } from "src/backend/interface/VehicleInterface";
import { IExternalVehicle } from "src/backend/interface/ExternalVehicleInterface";
import { IDirection } from "src/backend/interface/DirectionInterface";

namespace Realtime {
    const GTFS_REALTIME_URL_UMN = "https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&controller=vehicles2&action=list&agencyID=88";
    const GTFS_REALTIME_URL_VEHICLE_POSITIONS = "https://svc.metrotransit.org/mtgtfs/vehiclepositions.pb";
    const GTFS_REALTIME_URL_TRIP_UPDATES = "https://svc.metrotransit.org/mtgtfs/tripupdates.pb";

    /* Unused */
    const GTFS_REALTIME_URL_SERVICE_ALERTS = "https://svc.metrotransit.org/mtgtfs/alerts.pb";

    /**
     * Gets data of the specific stop
     * @param stopId stop ID
     * @returns stop data
     */
    export async function getStop(stopId: string) : Promise<IStop> {
        return await (await fetch(`https://svc.metrotransit.org/nextrip/${stopId}`)).json();
    }

    /**
     * Gets current vehicles running on route
     * @param routeId route ID
     * @returns list of vehicle data
     */
    export async function getVehicles(routeId: string) : Promise<Array<IVehicle> | undefined> {
        // Check if University Route
        if (Object.keys(Peak.UNIVERSITY_ROUTES).includes(routeId)) {
            let externalVehicles: Array<IExternalVehicle> = (await getRealtimeGTFSUniversity()).vehicles
                .filter((vehicle: IExternalVehicle) => Peak.UNIVERSITY_ROUTES[routeId] === vehicle.tripID);

            // Map external vehicles to internal Vehicle type
            let vehicles: Array<IVehicle> = externalVehicles.map((vehicle: IExternalVehicle) => ({
                trip_id: vehicle.tripID,
                direction_id: vehicle.directionID,
                direction: vehicle.direction,
                location_time: vehicle.location_time,
                termianl: vehicle.termianl,
                latitude: vehicle.lat,
                longitude: vehicle.lng,
                odometer: vehicle.odometer,
                speed: vehicle.speed,
                timestamp: vehicle.timestamp,
                bearing: vehicle.bearing || 0,
                route_id: vehicle.routeID || ''
            }));

            return vehicles;
        }
  
      // Check if the route exists in Transit
      if (!(await getRoute(routeId))) return;
  
      // Run on Metro Routes
      return await fetch(`https://svc.metrotransit.org/nextrip/vehicles/${routeId}`).then(async (response) => {
        if (response.ok && response.status === 200) {
          let vehicles: Array<IVehicle> = await response.json();
          vehicles.forEach((vehicle) => {
            vehicle.timestamp = vehicle.location_time;
          });
  
          return vehicles;
        } else {
          console.warn(`Data fetching encountered status code ${response.status} with Metro Vehicles`);
        }
      });
    }

    /**
     * Gets stops that are in route in specified direction
     * @param routeId route ID
     * @param directionId direction ID
     * @returns list of stops
     */
    export async function getStops(routeId: string, directionId: number) : Promise<Array<IStop>> {
        return await (await fetch(`https://svc.metrotransit.org/nextrip/stops/${routeId}/${directionId}`)).json();
    }

    /**
     * Gets information about specified stop on route in specified direction
     * @param routeId route ID
     * @param directionId direction ID
     * @param placeCode place code of stop
     * @returns description of stop
     */
    export async function getStopInfo(routeId: string, directionId: number, placeCode: string) : Promise<IStop> {
        return await (await fetch(`https://svc.metrotransit.org/nextrip/${routeId}/${directionId}/${placeCode}`)).json();
    }

    /**
     * Gets directions that vehicles are currently running
     * @param routeId route ID
     * @returns direcitons data
     */
    export async function getDirections(routeId: string) : Promise<Array<IDirection>> {
        return await (await fetch(`https://svc.metrotransit.org/nextrip/directions/${routeId}`)).json();
    }

    /**
     * Gets fetched data of university buses
     */
    export async function getRealtimeGTFSUniversity(): Promise<any> {
        return await fetch(GTFS_REALTIME_URL_UMN).then(async response => {
            if (response.ok && response.status === 200) {
                return await response.json();
            } else {
                console.warn(`Data fetching encountered status code ${response.status} with University Data. Response Body: ${await response.text()}`);
            }
        });
    }

    /* Private Helper Methods */

    /**
     * Gets specific route if running
     * @param routeId route ID
     * @returns route data
     */
    async function getRoute(routeId: string) : Promise<IRoute | undefined> {
        const routes = await getRoutes();
        return routes.find((route) => route.route_id === routeId);
    }

    /**
     * Gets running routes
     * @returns list of routes data
     */
    async function getRoutes() : Promise<Array<IRoute>> {
        return await (await fetch("https://svc.metrotransit.org/nextrip/routes")).json();
    }

    /* Depreciated */
    
    /**
     * Gets fetched vehicle position data
     * @depreciated
     */
    export async function getRealtimeGTFSVehiclePositions() : Promise<GtfsRealtimeBindings.transit_realtime.FeedMessage> {
        const response = await fetch(GTFS_REALTIME_URL_VEHICLE_POSITIONS);
        return response?.arrayBuffer().then(buffer => GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)));
    }

    /**
     * Gets fetched trip updates data
     * @deprecated
     */
    export async function getRealtimeGTFSTripUpdates() : Promise<GtfsRealtimeBindings.transit_realtime.FeedMessage | undefined> {
        return await fetch(GTFS_REALTIME_URL_TRIP_UPDATES).then(async response => {
            if (response.ok && response.status === 200) {
                return await response.arrayBuffer().then(buffer => GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)));
            } else {
                console.warn(`Data fetching encountered status code ${response.status} with Trip Updates.`);
            }
        });
    }
}

export default Realtime;