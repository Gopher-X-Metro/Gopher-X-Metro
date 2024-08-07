import Resources from "src/backend/Resources.ts";
import Schedule from "src/backend/Schedule.ts";
import Vehicle from "./elements/Vehicle.ts";
import URL from "src/backend/URL.ts";
import Route from "./elements/Route.ts";
import Realtime from "src/backend/Realtime.ts";
import Peak from "src/backend/Peak.ts";
import Stop from "./elements/Stop.ts";


namespace Routes {

    /* Public */

    /**
     * Refreshes the routes after the change of the url
     */
    export function refresh() {
        // Goes through each route that is not on the URL, and hides it
        routes.forEach(route => {
            if (!URL.getRoutes().has(route.getId())) route.setVisible(false);
        })

        // Goes through each route that is on the URL, and unhides it or creates it
        URL.getRoutes().forEach(routeId => {
            if (!routes.has(routeId)) loadRoute(routeId);
            if (!getRoute(routeId)?.isVisible()) getRoute(routeId)?.setVisible(true);
        })

        // Load Vehicles
        refreshVehicles();

        // Load Stops
        refreshStops();
    }
    /**
     * Gets a route object
     * @param routeId ID of the route
     */
    export function getRoute(routeId: string): Route | undefined { return routes.get(routeId); }
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
     * Sets a route's visibility
     * @param routeId ID of route
     * @param visible should the route be visible
     * @deprecated
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
        getRoute(routeId)?.getPaths()?.forEach(paths => (paths.getMarker() as google.maps.MVCObject).set("strokeWeight", bolded ? process.env.REACT_APP_LINE_BOLD : process.env.REACT_APP_LINE_NORMAL));
    }
    /**
     * Refreshes the vehicles
     */
    export async function refreshVehicles() 
    {
        // Updates Vehicles
        URL.getRoutes()?.forEach(async routeId => {
            const route = routes.get(routeId)

            for (const info of (await Realtime.getVehicles(routeId))) {
                if (!vehicles.has(info.trip_id)) {
                    // Add Vehicle
                    vehicles.set(info.trip_id, new Vehicle(info.trip_id, Resources.getRouteImages(routeId), map))
                    
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
                vehicles.get(info.trip_id)?.updateWindow();
                vehicles.get(info.trip_id)?.updateTimestamp();
            }
            
            // Sets all vehicles to be un-updated and set their visibility
            route?.getVehicles().forEach(vehicle => {
                vehicle.setVisible(vehicle.isUpdated() && route.isVisible());
            });
        })
    }
    /**
     * Refresh the stops
     */
    export async function refreshStops() {
        // Updates Stops
        URL.getRoutes()?.forEach(async routeId => {
            for (const schedule of (await Schedule.getRouteDetails(routeId)).schedules) {
                if (schedule.schedule_type_name === Schedule.getWeekDate()) {
                    for (const timetable of schedule.timetables) {
                        for (const info of await Schedule.getStopList(routeId, timetable.schedule_number)) {
                            // Load the stop
                            loadStop(info.stop_id, timetable.direction)?.then(stop => {
                                // Adds the stop if it has not been added yet
                                const route = routes.get(routeId)

                                if (route && !route?.getStops().has(info.stop_id)) {
                                    // Add stop
                                    route.addStopObject(info.stop_id, stop);

                                    // If the user hovers over the stop, change the width of the line
                                    stop?.getMarker().addListener("mouseover", () => {
                                        setBolded(route.getId(), true)
                                    });

                                    // If the user stops hovering over the stop, return back
                                    stop?.getMarker().addListener("mouseout", () => {
                                        setBolded(route.getId(), false)
                                    });
                                }
                            })
                        }
                    }
                }
            }
        })
    }
    /**
     * Loads a stop in routes
     * @param stopId     the id of the stop
     * @param direction  direction of the vehicle that passes through the stop
     * @returns the stop is requested to be loaded
     */
    export async function loadStop(stopId: string, direction: string) : Promise<Stop | undefined> {
        if (!stops.has(stopId)) {
            stops.set(stopId, (async () => {
                const info = await Realtime.getStop(stopId);
                const properties = info.stops[0]
                let stop: Stop | undefined;

                if (info.status !== 400) {
                    if (properties.stop_id === stopId || !stops.has(properties.stop_id)) {
                        stop = new Stop(properties.stop_id, "#4169e1", properties.description, direction, new google.maps.LatLng(properties.latitude, properties.longitude), map);
                        stops.set(properties.stop_id, Promise.resolve(stop));

                        stop.getMarker().addListener("click", async () => {
                            for (let s of stops) 
                                if ((await s[1])?.getId() !== properties.stop_id)
                                    (await s[1])?.infoWindow?.setVisible(false);
                        });

                        stop?.clearDepartures();

                        for (const departure of info.departures) 
                            stop?.addDeparture(departure.route_id, departure.trip_id, departure.departure_text, departure.direction_text, departure.description, departure.departure_time);

                        stop?.updateWindow();
                    } else stop = await stops.get(properties.stop_id);
                }

                return stop;
            })());
        }

        return stops.get(stopId);
    }

    /* Private */

    const routes = new Map<string, Route>();
    const stops = new Map<string, Promise<Stop | undefined>>();
    const vehicles = new Map<string, Vehicle>();
    let map: google.maps.Map;

    /**
     * Loads a route into the routes hash
     * @param routeId ID of the route
     */
    async function loadRoute(routeId: string) {
        const route = new Route(routeId, map);
        routes.set(routeId, route);

        if (Peak.UNIVERSITY_ROUTES[routeId]) {
            // Peak Campus Bus
            Peak.getPeakShapeIds(Peak.UNIVERSITY_ROUTES[routeId])
                .then(shapeIds => shapeIds
                    .forEach(async shapeId => {
                        loadPath(routeId, shapeId, await Resources.getColor(routeId), await Peak.getPeakShapeLocations(shapeId))
                    })
                )
        } else if ((await Schedule.getRoute(routeId)) !== undefined) {
            // Metro Bus
            Resources.getShapeIds(routeId)
                .then(shapeIds => shapeIds
                    .forEach(async shapeId => {
                        loadPath(routeId, shapeId, await Resources.getColor(routeId), await Resources.getShapeLocations(shapeId))
                    })
                )
        } else {
            // Does not exist
            console.warn(`Route with ID: ${routeId} not found`);
            Resources.createInactiveRoutePopup();
        }
    }

    export async function loadPath(routeId: string, shapeId: string, color: string, locations: Array<google.maps.LatLng>) {
        const route = getRoute(routeId);

        if (route) {
            route.addPath(shapeId, color, locations)

            // If the user hovers over the line, change the width
            route.getPaths().get(shapeId)?.getMarker().addListener("mouseover", () => setBolded(route.getId(), true));

            // If the user stops hovering over the line, return back
            route.getPaths().get(shapeId)?.getMarker().addListener("mouseout", () => setBolded(route.getId(), false));
        }
    }

    /* Depreciated */

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

            vehicle.updateWindow();
        }
    }
    /**
     * Sets the map for the routes
     * @param _map map object
     * @deprecated  Use init() instead
     */
    export function setMap(_map: google.maps.Map): void { map = _map; }
}

export default Routes;