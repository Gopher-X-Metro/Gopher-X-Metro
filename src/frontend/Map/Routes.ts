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
        Realtime.getVehicles(routeId)
            .then(vehicles => {
                if (vehicles === undefined) return; // If there are no vehicles, return, it's either an invalid request or invalid route. TODO: notify the user they are requesting an invalid route

                vehicles.forEach(async vehicle => {
                        // Add Vehicle
                        route.addVehicle(vehicle.trip_id, await Resources.getColor(routeId), Resources.getRouteImages(routeId));

                        // Goes through each trip update information 
                        updateVehicle(routeId,
                            vehicle.trip_id,
                            vehicle.trip_id,
                            vehicle.timestamp,
                            new google.maps.LatLng(vehicle.latitude as number, vehicle.longitude as number),
                            vehicle.bearing
                        );

                        // If the user hovers over the vehicle, change the width of the line
                        route.getVehicles().get(vehicle.trip_id)?.getMarker().addListener("mouseover", () => {
                            setBolded(route.getId(), true)
                        });

                        // If the user hovers over the vehicle, change the width of the line
                        route.getVehicles().get(vehicle.trip_id)?.getMarker().addListener("mouseout", () => {
                            setBolded(route.getId(), false)
                        });
                    })
            }
        )

        // Load Stops
        for (let schedule of (await Schedule.getSchedule(routeId)).schedules) {
            for (let timetable of schedule.timetables) {
                if (timetable.stop_list) {
                    for (let stop of timetable.stop_list) {
                        if (stop.info) {
                            for (let data of stop.info.stops) {
                                // Creates the stop if it has not been created yet
                                if (!stops.has(stop.stop_id)) {
                                    stops.set(stop.stop_id, new Stop(routeId, stop.stop_id, "0022FF", new google.maps.LatLng(Number(data.latitude), Number(data.longitude)), map));
                                }

                                if (!route.getStops().has(stop.stop_id)) {
                                    // Add stop
                                    route.addStopObject(stop.stop_id, stops.get(stop.stop_id));

                                    // Stop Text
                                    route.getStops().get(stop.stop_id)?.setDescription(
                                        "<div style=\"text-align:center; font-family: Arial, sans-serif;\">" +
                                            "<h2 style=\"margin-bottom: 10px;\">" + timetable.direction + "</h2>" +
                                            "<p style=\"margin-bottom: 20px; font-size: 16px;\">" + data.description + "</p>" +
                                            "<div style=\"margin-top: 20px;\">" +
                                                stop.info.departures.map(time => "<p style=\"margin: 5px 0; font-size: 14px;\">" + time.departure_text + "</p>").join("") +
                                            "</div>" +
                                        "</div>"
                                    );

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
                        }
                    }
                }
            }
        }
        
        let center = { lat: 44.97369560732433, lng: -93.2317259515601 }; // UMN location

        navigator.geolocation.getCurrentPosition(async position => {
            // console.log(await Plan.serviceNearby(center.lat, center.lng, null, 1, 20))
            // console.log(await Plan.routeLandmarks(routeId, null))
            console.log(await Plan.serviceNearby(center.lat, center.lng, null, 902, 0))
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
                        vehicle.timestamp,
                        new google.maps.LatLng(vehicle.latitude as number, vehicle.longitude as number),
                        vehicle.bearing
                    );
                })
            }
        }
        )
    }

    /* Private */

    const routes = new Map<string, Route>();
    const stops = new Map<string, Stop>();
    let map: google.maps.Map;

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

            vehicle.getInfoWindow().setContent(
                String(Math.round(Number(vehicle.getLastUpdated())))
            );
        }
    }
}

export default Routes;