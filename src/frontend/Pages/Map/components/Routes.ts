import L from "leaflet";
import Live from "src/backend/Live.ts";
import { ROUTE_NAMES } from "../elements/Vehicle";
import { LINE_BOLD, LINE_NORMAL } from "../elements/Path";
import Resources from "src/backend/Resources.ts";
import Schedule from "src/backend/Schedule.ts";
import Vehicle from "../elements/Vehicle.ts";
import URL from "src/backend/URL.ts";
import Route from "../elements/Route.ts";
import Realtime from "src/backend/Realtime.ts";
import Peak from "src/backend/Peak.ts";
import Stop from "../elements/Stop.ts";


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
     * Moves the map to show routes if none of them are in view, waiting briefly for their lines to load
     * @param routeIds IDs of the routes
     */
    export async function showRoute(...routeIds: string[]) : Promise<void> {
        for (let attempt = 0; attempt < 40; attempt++) {
            const bounds = L.latLngBounds([]);
            routeIds.forEach(id => getRoute(id)?.getPaths().forEach(path => bounds.extend((path.getMarker() as L.Polyline).getBounds())));
            if (bounds.isValid()) {
                if (!map.getBounds().intersects(bounds)) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 250));
        }
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
    export function init(_map: L.Map) : void {
        _map.on("zoomend", async () => {
            for (const stop of stops.values()) (await stop)?.setZoomSize(_map.getZoom());
        });
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
        getRoute(routeId)?.getPaths()?.forEach(paths => (paths.getMarker() as L.Polyline).setStyle({ weight: bolded ? LINE_BOLD : LINE_NORMAL }));
    }
    /**
     * Refreshes the vehicles
     */
    export async function refreshVehicles() 
    {
        // Updates Vehicles
        URL.getRoutes()?.forEach(async routeId => {
            const route = routes.get(routeId)

            for (const info of (await Realtime.getVehicles(routeId)) ?? []) {
                if (!vehicles.has(info.trip_id)) {
                    // Add Vehicle
                    vehicles.set(info.trip_id, new Vehicle(info.trip_id, Resources.getRouteImages(routeId), map))
                    
                    if (route) {
                        route.addVehicleObject(info.trip_id, vehicles.get(info.trip_id));

                        // If the user hovers over the vehicle, change the width of the line
                        route.getVehicles().get(info.trip_id)?.getMarker().on("mouseover", () => {
                            setBolded(route.getId(), true)
                        });

                        // If the user hovers over the vehicle, change the width of the line
                        route.getVehicles().get(info.trip_id)?.getMarker().on("mouseout", () => {
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

                vehicles.get(info.trip_id)?.setPosition(L.latLng(info.latitude as number, info.longitude as number), info.timestamp);
                vehicles.get(info.trip_id)?.setInfo(routeId, info);
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
            const details = await Schedule.getRouteDetails(routeId);

            // Campus routes Metro Transit doesn't publish (like 126) use Peak Transit's stops
            if (details.schedules.length === 0 && Peak.UNIVERSITY_ROUTES[routeId]) {
                loadPeakStops(routeId);
                return;
            }

            for (const schedule of details.schedules) {
                if (schedule.schedule_type_name === Schedule.getWeekDate()) {
                    for (const timetable of schedule.timetables) {
                        for (const info of (await Schedule.getStopList(routeId, timetable.schedule_number)) ?? []) {
                            // Load the stop
                            loadStop(info.stop_id, timetable.direction)?.then(async stop => {
                                // Adds the stop if it has not been added yet
                                const route = routes.get(routeId)
                                stop?.routeIds.add(routeId);

                                if (route && !route?.getStops().has(info.stop_id)) {
                                    // Add stop
                                    route.addStopObject(info.stop_id, stop);

                                    // If the user hovers over the stop, change the width of the line
                                    stop?.getMarker().on("mouseover", () => {
                                        setBolded(route.getId(), true)
                                    });

                                    // If the user stops hovering over the stop, return back
                                    stop?.getMarker().on("mouseout", () => {
                                        setBolded(route.getId(), false)
                                    });
                                }

                                refreshDepartures(stop);
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
                const properties = info?.stops?.[0];
                let stop: Stop | undefined;

                if (properties) {
                    if (properties.stop_id === stopId || !stops.has(properties.stop_id)) {
                        stop = new Stop(properties.stop_id, "#4169e1", properties.description, direction, L.latLng(properties.latitude, properties.longitude), map);
                        stops.set(properties.stop_id, Promise.resolve(stop));

                        stop.getMarker().on("click", async () => {
                            for (let s of stops) 
                                if ((await s[1])?.getId() !== properties.stop_id)
                                    (await s[1])?.infoWindow?.setVisible(false);
                        });
                    } else stop = await stops.get(properties.stop_id);
                }

                // A failed lookup is forgotten so the next refresh tries again
                if (!stop) stops.delete(stopId);
                return stop;
            })());
        }

        return stops.get(stopId);
    }

    /* Private */

    /**
     * Shows a campus route's stops and arrival times from Peak Transit
     * @param routeId ID of the route
     */
    async function loadPeakStops(routeId: string) {
        const peakRouteId = Peak.UNIVERSITY_ROUTES[routeId];
        const route = routes.get(routeId);
        if (!route) return;

        for (const info of await Live.getPeakRouteStops(peakRouteId)) {
            const stopId = "peak-" + info.id;
            if (!stops.has(stopId))
                stops.set(stopId, Promise.resolve(new Stop(stopId, "#4169e1", info.name, ROUTE_NAMES[routeId] ?? routeId, L.latLng(info.lat, info.lng), map)));
            const stop = await stops.get(stopId);
            if (!stop) continue;
            stop.routeIds.add(routeId);

            if (!route.getStops().has(stopId)) {
                route.addStopObject(stopId, stop);
                stop.getMarker().on("mouseover", () => setBolded(routeId, true));
                stop.getMarker().on("mouseout", () => setBolded(routeId, false));
            }

            stop.clearDepartures();
            for (const time of await Live.getPeakArrivals(info.id, peakRouteId)) {
                const minutes = Math.round((time - Date.now() / 1000) / 60);
                stop.addDeparture(routeId, "", minutes <= 0 ? "Due" : minutes + " Min", "", "", time);
            }
            stop.updateWindow();
        }
    }

    const routes = new Map<string, Route>();
    const stops = new Map<string, Promise<Stop | undefined>>();
    const vehicles = new Map<string, Vehicle>();
    let map: L.Map;

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
            // Does not exist; drop it from the link once we know the route list loaded
            console.warn(`Route with ID: ${routeId} not found`);
            if ((await Schedule.getRoutes())?.length) {
                routes.delete(routeId);
                URL.removeRoute(routeId);
            }
            Resources.createInactiveRoutePopup();
        }
    }

    async function loadPath(routeId: string, shapeId: string, color: string, locations: Array<L.LatLng>) {
        const route = getRoute(routeId);

        if (route) {
            route.addPath(shapeId, color, locations)

            // If the user hovers over the line, change the width
            route.getPaths().get(shapeId)?.getMarker().on("mouseover", () => setBolded(route.getId(), true));

            // If the user stops hovering over the line, return back
            route.getPaths().get(shapeId)?.getMarker().on("mouseout", () => setBolded(route.getId(), false));
        }
    }

    async function refreshDepartures(stop: Stop | undefined) : Promise<void> {
        if (stop)
            Realtime.getStop(stop.getId())
            .then( response => 
            {
                if (response?.departures) {
                    stop.clearDepartures();
                    
                    for (const departure of response.departures) 
                        stop?.addDeparture(departure.route_id, departure.trip_id, departure.departure_text, departure.direction_text, departure.description, departure.departure_time);

                    stop.updateWindow();
                }
            })
    } 
    /**
     * Sets the map for the routes
     * @param _map map object
     * @deprecated  Use init() instead
     */
    export function setMap(_map: L.Map): void { map = _map; }
}

export default Routes;