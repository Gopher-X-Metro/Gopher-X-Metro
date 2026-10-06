import L from "leaflet";
import Live from "src/backend/Live.ts";
import { setStopNameLookup } from "../elements/Vehicle";
import { ROUTE_NAMES } from "src/backend/RouteNames.ts";
import { LINE_BOLD, LINE_NORMAL } from "../elements/Path";
import Resources from "src/backend/Resources.ts";
import Schedule from "src/backend/Schedule.ts";
import Vehicle from "../elements/Vehicle.ts";
import RouteURL from "src/backend/URL.ts";
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
            if (!RouteURL.getRoutes().has(route.getId())) route.setVisible(false);
        })

        // Goes through each route that is on the URL, and unhides it or creates it
        RouteURL.getRoutes().forEach(routeId => {
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
        
        RouteURL.addListener(() => refresh());
        // Bus popups link their next stop here (an event avoids a Vehicle -> Routes import cycle)
        document.addEventListener("gxm:open-stop", event => openStop((event as CustomEvent<string>).detail));
        // Bus popups name their next stop the way the map's stop does
        setStopNameLookup(async stopId => (await findStop(stopId))?.getName());

        // Loads the static routes
        refresh()
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
        RouteURL.getRoutes().forEach(async routeId => {
            const route = routes.get(routeId)
            if (!route) return;

            for (const info of (await Realtime.getVehicles(routeId)) ?? []) {
                // Vehicles belong to their route: a campus bus that switches routes gets a new marker on the new one
                let vehicle = route.getVehicles().get(info.trip_id);
                if (!vehicle) {
                    vehicle = new Vehicle(info.trip_id, Resources.getRouteImages(routeId), map);
                    route.addVehicleObject(info.trip_id, vehicle);
                    // Hovering a vehicle bolds its route's line
                    vehicle.getMarker().on("mouseover", () => setBolded(routeId, true));
                    vehicle.getMarker().on("mouseout", () => setBolded(routeId, false));
                }

                if (routeId === "901" || routeId === "902") vehicle.setRailDirection(routeId, info.direction_id);
                else vehicle.setBusBearing(info.bearing);

                vehicle.setPosition(L.latLng(info.latitude, info.longitude), info.timestamp);
                vehicle.setInfo(routeId, info);
                vehicle.updateWindow();
                vehicle.updateTimestamp();
            }

            // Hides vehicles missing from this update
            route.getVehicles().forEach(vehicle => vehicle.setVisible(vehicle.isUpdated() && route.isVisible()));
        })
    }
    /**
     * Refresh the stops
     */
    export async function refreshStops() {

        // Updates Stops
        RouteURL.getRoutes().forEach(async routeId => {
            const details = await Schedule.getRouteDetails(routeId);

            // Campus routes Metro Transit doesn't publish (like 126) use Peak Transit's stops
            // Routes with no service today still show their stops, marked as not active
            const today = details.schedules.filter((s: any) => s.schedule_type_name === Schedule.getWeekDate());
            const inactive = today.length === 0;
            if (inactive && Peak.UNIVERSITY_ROUTES[routeId]) {
                loadPeakStops(routeId, true);
                return;
            }

            for (const schedule of inactive ? details.schedules.slice(0, 1) : today)
                for (const timetable of schedule.timetables)
                    for (const info of (await Schedule.getStopList(routeId, timetable.schedule_number)) ?? [])
                        loadStop(info.stop_id, timetable.direction).then(stop => {
                            if (!stop) return;
                            stop.routeIds.add(routeId);
                            if (inactive) stop.inactiveRouteIds.add(routeId);

                            const route = routes.get(routeId);
                            if (route && !route.getStops().has(info.stop_id)) {
                                route.addStopObject(info.stop_id, stop);
                                // Hovering a stop bolds its route's line
                                stop.getMarker().on("mouseover", () => setBolded(routeId, true));
                                stop.getMarker().on("mouseout", () => setBolded(routeId, false));
                            }

                            refreshDepartures(stop);
                        });
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

    /**
     * Opens a stop's departures window and brings it into view
     * @param stopId Metro Transit stop ID, or "peak-<id>" for a campus stop
     */
    export async function openStop(stopId: string) : Promise<void> {
        const stop = await findStop(stopId) ?? (stopId.startsWith("peak-") ? undefined : await loadStop(stopId, ""));
        if (!stop) return;
        for (const other of stops.values()) (await other)?.infoWindow?.setVisible(false);
        const location = (stop.getMarker() as L.CircleMarker).getLatLng();
        map.panTo(location);
        stop.infoWindow.setPosition(location);
        stop.infoWindow.setVisible(true);
        stop.updateWindow();
    }

    /**
     * Finds a stop already on the map
     * @param stopId Metro Transit stop ID, or "peak-<id>" for a campus stop
     */
    async function findStop(stopId: string) : Promise<Stop | undefined> {
        const stop = await stops.get(stopId);
        if (stop || !stopId.startsWith("peak-")) return stop;
        // Campus buses report Peak Transit stop IDs, but routes drawn from Metro Transit data use Metro IDs,
        // so fall back to the loaded stop nearest the Peak stop's location
        const peak = await Live.getPeakStop(Number(stopId.slice(5)));
        if (!peak) return undefined;
        let best: [number, Stop | undefined] = [NEAREST_STOP_METERS, undefined];
        for (const candidate of stops.values()) {
            const s = await candidate;
            const meters = s ? (s.getMarker() as L.CircleMarker).getLatLng().distanceTo([peak.lat, peak.lng]) : Infinity;
            if (meters < best[0]) best = [meters, s];
        }
        return best[1];
    }

    /** How close a loaded stop must be to count as the same stop as a Peak Transit one */
    const NEAREST_STOP_METERS = 60;

    /* Private */

    /**
     * Shows a campus route's stops and arrival times from Peak Transit
     * @param routeId ID of the route
     */
    async function loadPeakStops(routeId: string, inactive = false) {
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
            if (inactive) stop.inactiveRouteIds.add(routeId);

            if (!route.getStops().has(stopId)) {
                route.addStopObject(stopId, stop);
                stop.getMarker().on("mouseover", () => setBolded(routeId, true));
                stop.getMarker().on("mouseout", () => setBolded(routeId, false));
            }

            stop.clearDepartures();
            for (const time of await Live.getPeakArrivals(info.id, peakRouteId)) {
                const minutes = Math.round((time - Date.now() / 1000) / 60);
                // Like Metro's countdowns, anything over an hour out reads as a clock time
                const text = minutes <= 0 ? "Due" : minutes <= 60 ? minutes + " Min"
                    : new Date(time * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
                stop.addDeparture(routeId, "", text, "", "", time);
            }
            stop.updateWindow();
        }
    }

    const routes = new Map<string, Route>();
    const stops = new Map<string, Promise<Stop | undefined>>();
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
        } else if ((await Schedule.getRoutes())?.length) {
            // Does not exist; drop it from the link
            console.warn(`Route with ID: ${routeId} not found`);
            routes.delete(routeId);
            RouteURL.removeRoute(routeId);
            Resources.createInactiveRoutePopup();
        } else {
            // Metro Transit's route list didn't load (offline?), so try this route again shortly
            routes.delete(routeId);
            setTimeout(refresh, 5000);
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

    async function refreshDepartures(stop: Stop) : Promise<void> {
        const response = await Realtime.getStop(stop.getId());
        if (!response?.departures) return;
        stop.clearDepartures();
        for (const departure of response.departures)
            stop.addDeparture(departure.route_id, departure.trip_id, departure.departure_text, departure.direction_text, departure.description, departure.departure_time);
        stop.updateWindow();
    }
}

export default Routes;