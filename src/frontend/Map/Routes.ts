import Resources from "../../backend/Resources.ts";
import Schedule from "../../backend/Schedule.ts";
import Static from "../../backend/Static.ts";
import Vehicle from "./elements/Vehicle/Vehicle.ts";

import URL from "../../backend/URL.ts";
import Route from "./elements/Route.ts";
import Realtime from "../../backend/Realtime.ts";
import Plan from "../../backend/Plan.ts";
import Stop from "./elements/Stop/Stop.ts";

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
            if (!routes.has(routeId)) {
                loadRoute(routeId);
            }
            setVisible(routeId, true)
        })
    }
    /**
     * Gets a route object
     * @param routeId ID of the route
     */
    export function getRoute(routeId: string): Route | undefined { return routes.get(routeId); }
    /**
     * Sets the map for the routes
     * @param _map map object
     */
    export function setMap(_map: google.maps.Map): void { map = _map; }
    /**
     * Sets a route's visibility
     * @param routeId ID of route
     * @param visible should the route be visible
     */
    export function setVisible(routeId: string, visible: boolean) {
        getRoute(routeId)?.setVisible(visible);
    }
    /**
     * Sets a route's boldedness
     * @param routeId ID of route
     * @param bolded should the route be boolded
     */
    export function setBolded(routeId: string, bolded: boolean) {
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

        // Load Vehicles
        refreshVehicles();

        // Load Stops
        refreshStops();
        
        let center = { lat: 44.97369560732433, lng: -93.2317259515601 }; // UMN location

        navigator.geolocation.getCurrentPosition(async position => {
            // console.log(await Plan.serviceNearby(center.lat, center.lng, null, 1, 20))
            // console.log(await Plan.routeLandmarks(routeId, null))
            // console.log(await Plan.serviceNearby(center.lat, center.lng, null, 902, 0))
            // console.log(await Plan.nearestLandmark(center.lat, center.lng, null, 1, 10, null))
            // console.log(await Plan.nearestParkAndRides(center.lat, center.lng, null, 1))
            // console.log(await Plan.suggest("Blegen Hall", null))
            // console.log(await Plan.findaddress("dHA9MCNsb2M9MjY4MCNsbmc9MCNwbD0zOTcwI2xicz0xNDozMTQ="))
        });

        // console.log(await Realtime.getDirections(routeId));
        console.log(await Realtime.getVehicles(routeId));
        console.log(await Schedule.getSchedule(routeId));
        // console.log(await Schedule.getRoute(routeId));
        // console.log(await Realtime.getRoute(routeId));
        // console.log((await Schedule.getTimeTable(routeId, 1)))
        // console.log(await Schedule.getStopList(routeId, 2))
        // console.log((await Realtime.getDirections(routeId)))
        // console.log((await Realtime.getStops(routeId, 0)))
        // console.log((await Plan.routeLandmarks(routeId, "")).landmarks.landmark.filter(landmark => landmark.distance < 0.01))
        // console.log((await Realtime.getStopInfo(routeId, 1, "UNDA")))

        // console.log(stops);
    }

    /**
     * Refreshes the vehicles
     */
    export async function refreshVehicles() 
    {
        // Updates Vehicles
        URL.getRoutes()?.forEach(async routeId => {
            for (const info of (await Realtime.getVehicles(routeId))) {
                if (!vehicles.has(info.trip_id)) {
                    // Add Vehicle
                    vehicles.set(info.trip_id, new Vehicle(info.trip_id, await Resources.getColor(routeId), Resources.getRouteImages(routeId), map))
                    
                    const route = routes.get(routeId)

                    if (route) {
                        route.addVehicleObject(info.trip_id, vehicles.get(info.trip_id));

                        // If the user hovers over the vehicle, change the width of the line
                        route.getVehicles().get(info.trip_id)?.getMarker().addListener("mouseover", () => {
                            setBolded(route.getId(), true)
                        });

                        // If the user hovers over the vehicle, change the width of the line
                        route.getVehicles().get(info.trip_id)?.getMarker().addListener("mouseout", () => {
                            setBolded(route.getId(), false)
                        });
                    }
                }

                // Modify the vehicle
                if (routeId === "901") {
                    vehicles.get(info.trip_id)?.setBlueDirectionID(info.direction_id);
                } else if (routeId === "902") {
                    vehicles.get(info.trip_id)?.setGreenDirectionID(info.direction_id);
                } else {
                    vehicles.get(info.trip_id)?.setBusBearing(info.bearing);
                }

                vehicles.get(info.trip_id)?.setPosition(new google.maps.LatLng(info.latitude as number, info.longitude as number), info.timestamp);
                vehicles.get(info.trip_id)?.updateInfoWindow();
            }
        })
    }

    /**
     * Refresh the stops
     */
    export async function refreshStops() {
        // Updates Stops
        URL.getRoutes()?.forEach(async routeId => {
            for (let schedule of (await Schedule.getSchedule(routeId)).schedules) {
                for (let timetable of schedule.timetables) {
                    if (timetable.stop_list) {
                        for (let stop of timetable.stop_list) {
                            if (stop.info) {
                                for (let data of stop.info.stops) {
                                    // Creates the stop if it has not been created yet
                                    if (!stops.has(stop.stop_id)) {
                                        stops.set(stop.stop_id, new Stop(stop.stop_id, "#4169e1", data.description, timetable.direction, new google.maps.LatLng(Number(data.latitude), Number(data.longitude)), map));
                                        
                                        const route = routes.get(routeId)

                                        if (route) {
                                            // Add stop
                                            route.addStopObject(stop.stop_id, stops.get(stop.stop_id));

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

                                    stops.get(stop.stop_id)?.clearDepartures();

                                    for (const departure of stop.info.departures) {
                                        stops.get(stop.stop_id)?.addDeparture(departure.route_id, departure.trip_id, departure.departure_text, departure.direction_text, departure.description, departure.departure_time);
                                    }

                                    stops.get(stop.stop_id)?.updateInfoWindow(routeId);
                                }
                            }
                        }
                    }
                }
            }
        })
    }


    /* Private */

    const routes = new Map<string, Route>();
    const stops = new Map<string, Stop>();
    const vehicles = new Map<string, Vehicle>();
    let map: google.maps.Map;

    /**
     * Updates the current list of vehicles
     * @param routeId ID of vehicle's route
     * @param vehicleId ID of the vehicle
     * @param tripId 
     * @param timestamp time of last update
     * @param location location of vehicle
     * @deprecated We nolonger need to use this
     */
    async function updateVehicle(
        routeId: string,
        vehicleId: string,
        tripId: string,
        timestamp: number,
        location: google.maps.LatLng,
        bearing: number,
        direction_id: number) {

        // Find the vehicle
        let vehicle = Routes.getRoute(routeId)?.getVehicles()?.get(vehicleId);

        // Check if the vehicle exists
        if (vehicle !== undefined) {
            // If the id exists, modify the vehicle
            vehicle.setPosition(location, timestamp);

            vehicle.setTripId(tripId);
            if (routeId === "901") {
                vehicle.setBlueDirectionID(direction_id);
            } else if (routeId === "902") {
                vehicle.setGreenDirectionID(direction_id);
            } else {
                vehicle.setBusBearing(bearing);
            }

            vehicle.updateInfoWindow();
        }
    }
}

export default Routes;