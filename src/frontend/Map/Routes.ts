import Resources from "../../backend/Resources.ts";
import Schedule from "../../backend/Schedule.ts";
import Static from "../../backend/Static.ts";
import Vehicle from "./elements/Vehicle.ts";

import URL from "../../backend/URL.ts";
import Route from "./elements/Route.ts";
import Realtime from "../../backend/Realtime.ts";
import Plan from "../../backend/Plan.ts";

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
        getRoute(routeId)?.setVisible(visible);
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
        Resources.getShapeIds(routeId)
        .then(shapeIds => shapeIds
            .forEach(async shapeId => {
                // Add path
                route.addPath(shapeId, await Resources.getColor(routeId), await Resources.getShapeLocations(shapeId))
                            
                // If the user hovers over the line, change the width
                route.getPaths().get(shapeId)?.getLine().addListener("mouseover", () => setBolded(route.getId(), true));
                
                // If the user stops hovering over the line, return back
                route.getPaths().get(shapeId)?.getLine().addListener("mouseout", () => setBolded(route.getId(), false));    

            })
        )

        
        // Load Stops
        Resources.getStopsInfo(routeId)
        .then(stopInfos => stopInfos
            .forEach(async stopInfo => {
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
            })
        )

        // Load Vehicles
        Realtime.getVehicles(routeId)
        .then(vehicles => vehicles
            .forEach(async vehicle => {
                
                route.addVehicle(vehicle.trip_id, await Resources.getColor(routeId), Resources.getRouteImages(routeId));

                // Set Position
                route.getVehicles().get(vehicle.trip_id)?.setPosition(
                    new google.maps.LatLng(vehicle.latitude as number, vehicle.longitude as number), 
                    vehicle.timestamp
                )

                // If the user hovers over the vehicle, change the width of the line
                route.getVehicles().get(vehicle.trip_id)?.getMarker().addListener("mouseover", () => {
                    setBolded(route.getId(), true)
                });

                // If the user hovers over the vehicle, change the width of the line
                route.getVehicles().get(vehicle.trip_id)?.getMarker().addListener("mouseout", () => {
                    setBolded(route.getId(), false)
                });
            })
        )

        // navigator.geolocation.getCurrentPosition(async position => {
            // console.log(await Plan.serviceNearby(position.coords.latitude, position.coords.longitude, "", 0, 20))
            // console.log(await Plan.serviceNearby(44.97369560732433, -93.2317259515601, "", 1, 10))
            // console.log(await Plan.nearestLandmark(44.97369560732433, -93.2317259515601, "", 1, 10, ""))
        // });

        // console.log(await Plan.suggest("U", ""))
        // console.log(await Plan.findaddress("dHA9MCNsb2M9MTk0NyNsbmc9MCNwbD0yODY4I2xicz0xNDoxMTAxNg=="))

        // console.log(await Realtime.getVehicles(routeId));
        // console.log((await Schedule.getRouteDetails(routeId)))
        // console.log(await Schedule.getRoute(routeId))
        // console.log((await Schedule.getTimeTable(routeId, 1)))
        // console.log((await Schedule.getStopList(routeId, 1)))
        // console.log((await Realtime.getDirections(routeId)))
        // console.log((await Realtime.getStops(routeId, 0)))
        // console.log((await Plan.routeLandmarks(routeId, "")).landmarks.landmark.filter(landmark => landmark.distance < 0.01))
        // console.log((await Realtime.getStopInfo(routeId, 1, "UNDA")))
    }

    /**
     * Refreshes the Vehicles and calls the Data.getRealtimeGTFS
     */
    export async function refreshVehicles() {
        // Updates Vehicles
        URL.getRoutes()?.forEach(async routeId => {
                const vehicles = await Realtime.getVehicles(routeId);

                if (vehicles) {
                    // Goes through each vehicle in the route
                    vehicles.forEach(vehicle => {
                        // Goes through each trip update and gets the stop information    
                            updateVehicle(routeId, 
                            vehicle.trip_id, 
                            vehicle.trip_id, 
                            vehicle.location_time, 
                            new google.maps.LatLng(vehicle.latitude as number, vehicle.longitude as number),
                            vehicle.bearing
                        );
                    })
                }
            }
        )
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
        vehicleId: string, 
        tripId: string, 
        timestamp: number, 
        location: google.maps.LatLng,
        bearing: number) {
        
        // Find the vehicle
        let vehicle = Routes.getRoute(routeId)?.getVehicles()?.get(vehicleId);
        
        // Check if the vehicle exists
        if (vehicle !== undefined) {
            // If the id exists, modify the vehicle
            vehicle.setPosition(location, timestamp);
            
            vehicle.setTripId(tripId);

            vehicle.setBusBearing(bearing);
        }
    }
}

export default Routes;