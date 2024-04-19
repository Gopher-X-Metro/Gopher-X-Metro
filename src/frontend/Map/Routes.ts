import Resources from "../../backend/Resources.ts";
import Schedule from "../../backend/Schedule.ts";
import Static from "../../backend/Static.ts";
import Vehicle from "./elements/Vehicle.ts";

import URL from "../../backend/URL.ts";
import Route from "./elements/Route.ts";
import Realtime from "../../backend/Realtime.ts";

namespace Routes {
    
    /* Public */
    
    /**
     * Refreshes the routes after the change of the url
     */
    export function refresh() {
        // Goes through each route that is not on the URL, and hides it
        routes.forEach(routeId => {
            if (!URL.getRoutes().has(routeId.getId())) setVisible(routeId.getId(), false);
        })
        
        // Goes through each route that is on the URL, and unhides it or creates it
        URL.getRoutes().forEach(routeId => {
            if (!routes.has(routeId)){ 
                loadRoute(routeId);
            }
            setVisible(routeId, true)
        })
    }
    /**
     * Gets a route object
     * @param routeId ID of the route
     */
    export function getRoute(routeId : string) : Route | undefined { return routes.get(routeId); }
    /**
     * Sets the map for the routes
     * @param _map map object
     */
    export function setMap(_map : google.maps.Map) : void { map = _map; }
    /**
     * Sets a route's visibility
     * @param routeId ID of route
     * @param visible should the route be visible
     */
    export function setVisible(routeId : string, visible : boolean) {
        getRoute(routeId)?.getPaths().forEach(path => path.getLine().setVisible(visible));
        getRoute(routeId)?.getStops()?.forEach(stop => stop.getMarker().setVisible(visible));
        getRoute(routeId)?.getVehicles().forEach(vehicle => vehicle.getMarker().map = visible ? map : null);
    }
    /**
     * Sets a route's boldedness
     * @param routeId ID of route
     * @param bolded should the route be boolded
     */
    export function setBolded(routeId : string, bolded : boolean) {
        getRoute(routeId)?.getPaths()?.forEach(paths => paths.getLine().set("strokeWeight", bolded ? process.env.REACT_APP_LINE_BOLD : process.env.REACT_APP_LINE_NORMAL));
    }


    /* Private */

    /**
     * Loads a route into the routes hash
     * @param routeId ID of the route
     */
    async function loadRoute(routeId: string) {
        const route = new Route(routeId, map);

        routes.set(routeId, route);

        // Load paths
        for (const shapeId of await Resources.getShapeIds(routeId)) {
            // Add path
            route.addPath(shapeId, await Resources.getColor(routeId), await Resources.getShapeLocations(shapeId))
                        
            // If the user hovers over the line, change the width
            route.getPaths().get(shapeId)?.getLine().addListener("mouseover", () => setBolded(route.getId(), true));
            
            // If the user stops hovering over the line, return back
            route.getPaths().get(shapeId)?.getLine().addListener("mouseout", () => setBolded(route.getId(), false));      
        };

        

        // Load Stops
        for (const stopInfo of await Resources.getStopsInfo(routeId)) {
            const stop = stopInfo.stops[0]

            // Creates the stop if it has not been created yet
            if (!route.getStops().has(stop.stop_id)) {

                // Create stop
                route.addStop(stop.stop_id, "0022FF", new google.maps.LatLng(Number(stop.latitude), Number(stop.longitude)));
                
                // If the user hovers over the stop, change the width of the line
                route.getStops().get(stop.stop_id)?.getMarker().addListener("mouseover", () => {
                    setBolded(route.getId(), true)
                });
                
                // If the user stops hovering over the stop, return back
                route.getStops().get(stop.stop_id)?.getMarker().addListener("mouseout", () => {
                    setBolded(route.getId(), false)
                }); 
            }
        }
        
        // console.log((await Realtime.getVehicles(routeId)).map(vehicle => vehicle))

        // console.log((await Schedule.getRouteDetails(routeId)))
        // console.log((await Schedule.getTimeTable(routeId, 1)))
        // console.log((await Schedule.getStopList(routeId, 1)))
        // console.log((await Realtime.getStops(routeId, 1)))
        // console.log((await Realtime.getStopInfo(routeId, 1, "UNDA")))
    }

    /**
     * Refreshes the Vehicles and calls the Data.getRealtimeGTFS
     */
    export async function refreshVehicles() {
        // Updates Vehicles
        URL.getRoutes()?.forEach(async routeId => {
            if (Object.keys(Resources.UNIVERSITY_ROUTES).indexOf(routeId) === -1) {
                // Operate on the data of the vehilces not part of the University
                const tripUpdates = await Realtime.getRealtimeGTFSTripUpdates();
                
                if (tripUpdates){
                    // Goes through each vehicle in the route
                    (await Realtime.getVehicles(routeId)).forEach(vehicle => {
                        // Goes through each trip update and gets the stop information                     
                        tripUpdates?.entity.forEach(update => {
                            if (update.tripUpdate?.trip.tripId === vehicle.trip_id)
                                updateVehicle(routeId, 
                                vehicle.trip_id, 
                                vehicle.trip_id, 
                                vehicle.location_time, 
                                new google.maps.LatLng(vehicle.latitude as number, vehicle.longitude as number),
                                vehicle.bearing
                            );
                        })
                    })
                }
            } else {
                const realtimeUniversityRoutes = await Realtime.getRealtimeGTFSUniversity();
                
                // Operate on the data of vehicles that are part of the University
                if (realtimeUniversityRoutes) {
                    console.log(realtimeUniversityRoutes)
                    realtimeUniversityRoutes.vehicles.forEach(vehicle => { 
                        if (Resources.UNIVERSITY_ROUTES[routeId] === vehicle.routeID){
                            updateVehicle(routeId, 
                                vehicle.vehicleID, 
                                "empty",
                                Date.now(),
                                new google.maps.LatLng(vehicle.lat, vehicle.lng),
                                vehicle.heading
                            ) 
                        }
                    })
                };
            }
        })
    }

    const routes = new Map<string, Route>();
    let map : google.maps.Map;

    /* Private */

    /**
     * Updates the current list of vehicles
     * @param routeId ID of vehicle's route
     * @param vehicleId ID of the vehicle
     * @param tripId 
     * @param timestamp time of last update
     * @param location location of vehicle
     */
    async function updateVehicle(
        routeId: string, 
        vehicleId: string | null | undefined, 
        tripId: string | null | undefined, 
        timestamp: number | null | undefined, 
        location: google.maps.LatLng,
        bearing: number) {

        if (!vehicleId || !tripId || !timestamp) return;
        
        // Find the vehicle
        let vehicle = Routes.getRoute(routeId)?.getVehicles()?.get(vehicleId);
        
        // Check if the vehicle exists
        if (vehicle === undefined) {
            
            // If the vehicle did not exist, make a new one
            Routes.getRoute(routeId)?.addVehicle(vehicleId, await Resources.getColor(routeId), Resources.getRouteImages(routeId));

            vehicle = Routes.getRoute(routeId)?.getVehicles()?.get(vehicleId) as Vehicle;
            
            if (vehicle){
                // When the user hovers over the marker, make route thicker
                vehicle.getMarker().addListener("mouseover", () => Routes.setBolded(routeId, true));    

                // When the user stops hovering over the marker, return back
                vehicle.getMarker().addListener("mouseout", () => Routes.setBolded(routeId, false));
            }
        }

        // If the id exists, modify the vehicle
        vehicle.setPosition(location, timestamp);
        
        vehicle.setTripId(tripId);

        vehicle.setBusBearing(bearing);
    }
}

export default Routes;