import Resources from "src/backend/Resources";
import Schedule from "src/backend/Schedule";
import Vehicle from "src/frontend/Pages/Map/elements/Vehicle";
import URL from "src/backend/URL";
import Route from "src/frontend/Pages/Map/elements/Route";
import Realtime from "src/backend/Realtime";
import Stop from "src/frontend/Pages/Map/elements/Stop";
import Data from "src/data/Data";
import DataNetwork from "src/backend/Data";

namespace Routes {
    const routes = new Map<string, Route>();
    const stops = new Map<string, Promise<Stop | undefined>>();
    const vehicles = new Map<string, Vehicle>();
    let map: google.maps.Map;

    /**
     * Initalzes Routes
     * @param _map map object
     */
    export function init(_map: google.maps.Map) : void {
        map = _map;

        URL.addListener(() => refresh());

        // Loads the static routes
        refresh()
    }

    /**
     * Gets a route object
     * @param routeId ID of route
     * @returns route object
     */
    export function getRoute(routeId: string): Route | undefined {
        return routes.get(routeId); 
    }

    /**
     * Refreshes the vehicles
     */
    export async function refreshVehicles() : Promise<void> {
        // Updates Vehicle Data
        for (const routeId of URL.getRoutes()) {
            if (routeId != "FOOTBALL") {
                Data.Vehicle.reload(routeId);
            }
        }

        // Updates Vehicles
        for (const routeId of URL.getRoutes()) {
            const route = routes.get(routeId);
            const vehicleData = await Realtime.getVehicles(routeId);
        
            if (!vehicleData) return;

            for (const vehicle of vehicleData) {
                if (!vehicles.has(vehicle.trip_id)) {
                    // Add Vehicle
                    vehicles.set(vehicle.trip_id, new Vehicle(vehicle.trip_id, Resources.getRouteImages(routeId), map));

                    if (route) {
                        route.addVehicleObject(vehicle.trip_id, vehicles.get(vehicle.trip_id));

                        // If the user hovers over the vehicle, change the width of the line
                        route.getVehicles().get(vehicle.trip_id)?.getMarker().addListener("mouseover", () => {
                            setBolded(route.getId(), true)
                        });

                        // If the user hovers over the vehicle, change the width of the line
                        route.getVehicles().get(vehicle.trip_id)?.getMarker().addListener("mouseout", () => {
                            setBolded(route.getId(), false)
                        });
                    }
                }

                // Modify the vehicle
                if (routeId === "901") {
                    vehicles.get(vehicle.trip_id)?.setBlueDirectionID(Number(vehicle.direction_id));
                } else if (routeId === "902") {
                    vehicles.get(vehicle.trip_id)?.setGreenDirectionID(Number(vehicle.direction_id));
                } else {
                    vehicles.get(vehicle.trip_id)?.setBusBearing(Number(vehicle.bearing));
                }

                vehicles.get(vehicle.trip_id)?.setPosition(new google.maps.LatLng(vehicle.latitude, vehicle.longitude), vehicle.timestamp);
                vehicles.get(vehicle.trip_id)?.updateWindow();
                vehicles.get(vehicle.trip_id)?.updateTimestamp();
            }
            
            // Sets all vehicles to be un-updated and set their visibility
            route?.getVehicles().forEach(vehicle => {
                vehicle.setVisible(vehicle.isUpdated() && route.isVisible());
            });
        }
    }

    /**
     * Refreshes the stops
     */
    export async function refreshStops() : Promise<void> {
        // Updates Stop Data
        for (const routeId in URL.getRoutes()) {
            if (routeId != "FOOTBALL") {
                Data.Departure.reload(routeId);
            }
        }

        // Updates Stops
        for (const routeId of URL.getRoutes()) {
            if(routeId !== "FOOTBALL") {
                const scheduleResponse = await Schedule.getRouteDetails(routeId);

                for (const schedule of scheduleResponse.schedules) {
                    if (schedule.schedule_type_name === Schedule.getWeekDate()) {
                        for (const timetable of schedule.timetables) {
                            for (const stops of await Schedule.getStopList(routeId, timetable.schedule_number)) {
                                // Load the stop
                                loadStop(stops.stop_id, timetable.direction)?.then(async stop => {
                                    // Adds the stop if it has not been added yet
                                    const route = routes.get(routeId);

                                    if (route && !route?.getStops().has(stops.stop_id)) {
                                        // Add stop
                                        route.addStopObject(stops.stop_id, stop);

                                        // If the user hovers over the stop, change the width of the line
                                        stop?.getMarker().addListener("mouseover", () => {
                                            setBolded(route.getId(), true);
                                        });

                                        // If the user stops hovering over the stop, return back
                                        stop?.getMarker().addListener("mouseout", () => {
                                            setBolded(route.getId(), false);
                                        });
                                    }

                                    refreshDepartures(stop);
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Loads a stop in routes
     * @param stopId id of stop
     * @param direction direction of vehicle that passes through stop
     * @returns stop requested to be loaded
     */
    export async function loadStop(stopId: string, direction: string) : Promise<Stop | undefined> {
        let stop: Stop | undefined;
        if (!stops.has(stopId)) {
            stops.set(stopId, (async () => {
                const stopI = await Realtime.getStop(stopId);
                const stopData = stopI.stops[0];
                if (stopI.status !== 400 && stopData) {
                    if (stopData.stop_id === stopId || !stops.has(stopData.stop_id)) {
                        stop = new Stop(stopData.stop_id, "#4169e1", stopData.description, direction, new google.maps.LatLng(stopData.latitude, stopData.longitude), map);
                        stops.set(stopData.stop_id, Promise.resolve(stop));

                        stop.getMarker().addListener("click", async () => {
                            for (let s of stops) {
                                if ((await s[1])?.getId() !== stopData.stop_id) {
                                    (await s[1])?.infoWindow?.setVisible(false);
                                }
                            }
                        });
                    } else {
                        stop = await stops.get(stopData.stop_id);
                    }
                }

                return stop;
            })());
        }

        return stops.get(stopId);
    }

    /* Private Helper Methods */

    /**
     * Refreshes routes after the change of url
     */
    function refresh() : void {
        // Goes through each route that is not on the URL and hides it
        routes.forEach(route => {
            if (!URL.getRoutes().has(route.getId())) {
                route.setVisible(false);
            }
        });

        // Goes through each route that is on the URL and unhides it or creates it
        URL.getRoutes().forEach(routeId => {
            if (!routes.has(routeId)) {
                loadRoute(routeId);
            }

            if (!getRoute(routeId)?.isVisible()) {
                getRoute(routeId)?.setVisible(true);
            }
        });

        // Load Vehicles
        refreshVehicles();

        // Load Stops
        refreshStops();
    }

    /**
     * Sets a route's boldedness
     * @param routeId ID of route
     * @param bolded boolean should route be boolded
     */
    function setBolded(routeId: string, bolded: boolean) : void {
        getRoute(routeId)?.getPaths()?.forEach(paths => {
            (paths.getMarker() as google.maps.MVCObject).set("strokeWeight", bolded ? process.env.REACT_APP_LINE_BOLD : process.env.REACT_APP_LINE_NORMAL);
        });
    }

    /**
     * Loads a route into routes hash
     * @param routeId ID of route
     */
    async function loadRoute(routeId: string) : Promise<void> {
        if (routeId != "FOOTBALL") {
            Data.Route.load(routeId);
        }

        const route = new Route(routeId, map);
        routes.set(routeId, route);

        DataNetwork.instance.getPaths(routeId)
        .then(paths => {
            if (paths) {
                paths.forEach(async path => {
                    loadPath(routeId, path.shapeId, await Resources.getColor(routeId), DataNetwork.instance.pathPointsToGoogleLatLng(path.points))
                })
            } else {
                // Does not exist
                console.warn(`Route with ID: ${routeId} not found`);
                Resources.createInactiveRoutePopup();
            }
        })
    }

    /**
     * Loads a path into a route
     * @param routeId ID of route of path
     * @param shapeId ID of shape of path
     * @param color color of path
     * @param locations lat and lng array of path
     */
    async function loadPath(routeId: string, shapeId: string, color: string, locations: Array<google.maps.LatLng>) : Promise<void> {
        const route = getRoute(routeId);

        if (route) {
            route.addPath(shapeId, color, locations);

            // If user hovers over the line, change the width
            route.getPaths().get(shapeId)?.getMarker().addListener("mouseover", () => setBolded(route.getId(), true));

            // If user stops hovering over the line, return back
            route.getPaths().get(shapeId)?.getMarker().addListener("mouseout", () => setBolded(route.getId(), false));
        }
    }

    /**
     * Refreshes stop departures
     * @param stop stop object to update departures
     */
    async function refreshDepartures(stop: Stop | undefined) : Promise<void> {
        if (stop) {
            const stopData = await Realtime.getStop(stop.getId());

            if (stopData.status !== 400) {
                stop.clearDepartures();

                for (const departure of stopData.departures) {
                    stop?.addDeparture(departure.route_id, departure.trip_id, departure.departure_text, departure.direction_text, departure.description, departure.departure_time);
                }

                stop.updateWindow();
            }
        }
    } 

    /* Depreciated / Unused */

    /**
     * Sets a route's visibility
     * @param routeId ID of route
     * @param visible should route be visible
     * @deprecated
     */
    function setVisible(routeId: string, visible: boolean) : void {
        getRoute(routeId)?.setVisible(visible);
    }

    /**
     * Updates current list of vehicles
     * @param routeId ID of vehicle's route
     * @param vehicleId ID of vehicle
     * @param tripId ID of trip
     * @param timestamp time of last update
     * @param location location of vehicle
     * @deprecated We no longer need to use this
     */
    async function updateVehicle(routeId: string, vehicleId: string, tripId: string, timestamp: number, location: google.maps.LatLng, bearing: number, direction_id: number) : Promise<void> {
        // Find the vehicle
        let vehicle = Routes.getRoute(routeId)?.getVehicles()?.get(vehicleId);

        // Check if vehicle exists
        if (vehicle !== undefined) {
            // If id exists, modify vehicle
            vehicle.setPosition(location, timestamp);

            vehicle.setTripId(tripId);
            if (routeId === "901") {
                vehicle.setBlueDirectionID(direction_id);
            } else if (routeId === "902") {
                vehicle.setGreenDirectionID(direction_id);
            } else {
                vehicle.setBusBearing(bearing);
            }

            vehicle.updateWindow();
        }
    }

    /**
     * Sets map for routes
     * @param _map map object
     * @deprecated  Use init() instead
     */
    function setMap(_map: google.maps.Map): void { 
        map = _map; 
    }
}

export default Routes;