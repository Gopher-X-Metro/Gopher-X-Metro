import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import Realtime from "src/backend/Realtime.ts";

/**
 * Rider helpers: nearby stops, departures, next stops of vehicles, and service alerts
 */
namespace Live {
    export interface NearbyStop {
        id: string;
        name: string;
        lat: number;
        lng: number;
        meters: number;
    }

    export interface Departure {
        tripId: string;
        routeId: string;
        routeName: string;
        text: string;
        time: number;
        actual: boolean;
        description: string;
        direction: string;
    }

    export interface StopDepartures {
        departures: Departure[];
        alerts: string[];
    }

    export interface Alert {
        id: string;
        header: string;
        routes: string[];
        description?: string;
        created?: number;
        start?: number;
        end?: number;
    }

    /**
     * Gets every stop as [stop_id, name, lat, lon]
     */
    export async function getStops() : Promise<Array<[string, string, number, number]>> {
        if (!stops)
            stops = fetch(process.env.PUBLIC_URL + "/gtfs/stops.json")
                .then(response => response.ok ? response.json() : [])
                .catch(() => []);
        return stops;
    }

    /**
     * Gets the name of a stop
     * @param stopId ID of the stop
     */
    export async function getStopName(stopId: string) : Promise<string | undefined> {
        if (!stopNames) stopNames = new Map((await getStops()).map(stop => [stop[0], stop[1]]));
        return stopNames.get(stopId);
    }

    /**
     * Finds the closest stops to a location
     * @param lat       latitude
     * @param lng       longitude
     * @param count     how many stops to return
     * @param radius    furthest distance in meters
     */
    export async function nearestStops(lat: number, lng: number, count = 5, radius = 800) : Promise<NearbyStop[]> {
        return (await getStops())
            .map(([id, name, sLat, sLng]) => ({ id, name, lat: sLat, lng: sLng, meters: distance(lat, lng, sLat, sLng) }))
            .filter(stop => stop.meters <= radius)
            .sort((a, b) => a.meters - b.meters)
            .slice(0, count);
    }

    /**
     * Gets the upcoming departures and alerts of a stop
     * @param stopId ID of the stop
     */
    export async function getDepartures(stopId: string) : Promise<StopDepartures> {
        const data = await Realtime.getStop(stopId);
        // No answer (offline, or Metro Transit down) is an error, not a stop with no buses
        if (!data) throw new Error("Departures unavailable for stop " + stopId);
        return {
            departures: (data.departures ?? []).map((d: any) => ({
                tripId: String(d.trip_id),
                routeId: d.route_id,
                routeName: d.route_short_name ?? d.route_id,
                text: formatDeparture(d.departure_text, d.departure_time),
                time: d.departure_time,
                actual: d.actual,
                description: d.description,
                direction: d.direction_text,
            })),
            alerts: (data.alerts ?? []).map((a: any) => a.alert_text).filter(Boolean),
        };
    }

    export interface MetroTrip {
        nextStop?: string;
        nextStopId?: string;
        arrival?: number;
        delayMinutes?: number;
        stopped?: boolean;
        busNumber?: string;
    }

    /**
     * Gets the live details of a Metro Transit trip: next stop, predicted arrival, delay and bus number
     * @param tripId ID of the trip
     */
    export async function getMetroTrip(tripId: string, routeId?: string) : Promise<MetroTrip> {
        const [positions, updates] = await Promise.all([getMetroPositions(), getMetroUpdates()]);
        const position = positions.get(tripId);
        const now = Date.now() / 1000;
        // The first listed stop still ahead of the bus. Trip updates are sparse (unchanged stops are omitted),
        // so the vehicle position's own stop_id is the fallback next stop.
        const tripUpdates = updates.get(tripId);
        const next = tripUpdates?.find(u => Number(u.arrival?.time ?? u.departure?.time ?? 0) >= now - 30);
        // The feed's stop_id can be a timepoint several stops ahead, so locate the bus on the trip's own stop list
        const located = routeId ? await locateOnTrip(routeId, tripId, position, position?.stopId ?? next?.stopId) : undefined;
        const stopId = located?.stopId ?? position?.stopId ?? next?.stopId;
        const stopped = located ? located.at && !!position?.stopped : position?.stopped;
        const match = tripUpdates?.find(u => u.stopId === stopId);
        const event = match?.arrival ?? match?.departure;
        const delay = (event ?? next?.arrival ?? next?.departure)?.delay;
        let arrival = event?.time ? Number(event.time) : undefined;
        // Stop omitted from the trip updates: fall back to the stop's NexTrip prediction for this trip
        if (arrival === undefined && stopId) {
            const data = await Realtime.getStop(stopId);
            const departure = (data?.departures ?? []).find((d: any) => String(d.trip_id) === tripId);
            if (departure?.departure_time) arrival = Number(departure.departure_time);
        }
        return {
            nextStop: stopId ? await getStopName(stopId) : undefined,
            nextStopId: stopId,
            arrival,
            delayMinutes: delay !== undefined && delay !== null ? Math.round(Number(delay) / 60) : undefined,
            stopped,
            busNumber: position?.label,
        };
    }

    /**
     * Straight-line meters from a Metro Transit trip's bus to a stop, or undefined if either location is unknown
     * @param tripId ID of the trip
     * @param stopId ID of the stop
     */
    export async function busDistanceToStop(tripId: string, stopId: string) : Promise<number | undefined> {
        const [position, stop] = await Promise.all([
            getMetroPositions().then(p => p.get(tripId)),
            getStops().then(all => all.find(s => s[0] === stopId)),
        ]);
        if (position?.lat === undefined || position?.lng === undefined || !stop) return undefined;
        return distance(position.lat, position.lng, stop[2], stop[3]);
    }

    /**
     * Gets a campus bus stop's name and location
     * @param stopId Peak Transit ID of the stop
     */
    export async function getPeakStop(stopId: number) : Promise<{ name: string, lat: number, lng: number } | undefined> {
        type PeakStop = { name: string, lat: number, lng: number };
        peakStopDetails ??= fetch(PEAK_URL + "stop2")
            .then(response => response.json())
            .then(data => new Map<number, PeakStop>((data.stop ?? []).map((stop: any) => [stop.stopID, { name: stop.longName, lat: Number(stop.lat), lng: Number(stop.lng) }])))
            .catch(() => new Map<number, PeakStop>());
        return (await peakStopDetails)?.get(stopId);
    }
    let peakStopDetails: Promise<Map<number, { name: string, lat: number, lng: number }>> | undefined;

    /**
     * Gets the name of a campus bus stop
     * @param stopId Peak Transit ID of the stop
     */
    export async function getPeakStopName(stopId: number) : Promise<string | undefined> {
        if (!peakStops)
            peakStops = fetch(PEAK_URL + "stop2")
                .then(response => response.json())
                .then(data => new Map((data.stop ?? []).map((stop: any) => [stop.stopID, stop.longName])))
                .catch(() => new Map());
        return (await peakStops).get(stopId);
    }

    /**
     * Gets the active service alerts for a set of routes
     * @param routeIds IDs of the routes
     */
    export async function getAlerts(routeIds: Set<string>) : Promise<Alert[]> {
        if (!alerts || Date.now() - alertsFetched > 120000) {
            alertsFetched = Date.now();
            alerts = fetch("https://svc.metrotransit.org/mtgtfs/alerts.pb")
                .then(response => response.arrayBuffer())
                .then(buffer => {
                    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
                    const now = Date.now() / 1000;
                    return feed.entity
                        // An alert without active periods is active for as long as it's in the feed
                        .filter(entity => entity.alert && (!entity.alert.activePeriod?.length || entity.alert.activePeriod.some(p =>
                            Number(p.start ?? 0) <= now && (!p.end || Number(p.end) >= now))))
                        .map(entity => ({
                            id: entity.id,
                            header: entity.alert?.headerText?.translation?.[0]?.text ?? "",
                            description: entity.alert?.descriptionText?.translation?.[0]?.text ?? "",
                            start: Number(entity.alert?.activePeriod?.[0]?.start ?? 0) || undefined,
                            end: Number(entity.alert?.activePeriod?.[0]?.end ?? 0) || undefined,
                            routes: [...new Set((entity.alert?.informedEntity ?? []).map(i => i.routeId).filter(Boolean) as string[])],
                        }));
                })
                .catch(() => []);
        }
        return (await alerts).filter(alert => alert.header && alert.routes.some(route => routeIds.has(route)));
    }

    /**
     * Gets the estimated arrival (epoch seconds) of a campus route at a stop
     * @param stopId    Peak Transit stop ID
     * @param routeId   Peak Transit route ID
     */
    export async function getPeakEta(stopId: number, routeId: number) : Promise<number | undefined> {
        if (!peakEtas || Date.now() - peakEtasFetched > 15000) {
            peakEtasFetched = Date.now();
            peakEtas = fetch(PEAK_URL + "eta")
                .then(response => response.json())
                .then(data => new Map((data.stop ?? []).map((eta: any) => [eta.stopID + "|" + eta.routeID, eta])))
                .catch(() => new Map());
        }
        return (await peakEtas).get(stopId + "|" + routeId)?.ETA1 || undefined;
    }

    /**
     * Gets the next two arrivals (epoch seconds) of a campus route at a stop
     */
    export async function getPeakArrivals(stopId: number, routeId: number) : Promise<number[]> {
        await getPeakEta(stopId, routeId);
        const eta = (await peakEtas as Map<any, any>).get(stopId + "|" + routeId);
        return [eta?.ETA1, eta?.ETA2].filter(time => time && time > Date.now() / 1000);
    }

    /**
     * Gets the stops served by a campus route
     * @param routeId Peak Transit route ID
     */
    export async function getPeakRouteStops(routeId: number) : Promise<Array<{ id: number, name: string, lat: number, lng: number }>> {
        if (!peakRouteStops)
            peakRouteStops = Promise.all([
                fetch(PEAK_URL + "routestop2").then(response => response.json()),
                fetch(PEAK_URL + "stop2").then(response => response.json()),
            ]).then(([routeStops, stops]) => {
                const byId = new Map((stops.stop ?? []).filter((stop: any) => !stop.disabled && !stop.closed).map((stop: any) => [stop.stopID, stop]));
                return (routeStops.routeStops ?? []).filter((rs: any) => !rs.disabled && byId.has(rs.stopID)).map((rs: any) => {
                    const stop: any = byId.get(rs.stopID);
                    return { routeId: rs.routeID, id: stop.stopID, name: stop.longName, lat: Number(stop.lat), lng: Number(stop.lng) };
                });
            }).catch(() => []);
        return (await peakRouteStops).filter((stop: any) => stop.routeId === routeId);
    }

    /**
     * Gets recent campus bus notices (detours, game days) for campus routes on the map
     * @param routeIds IDs of the routes on the map
     */
    export async function getCampusNotices(routeIds: Set<string> | null, days = NOTICE_DAYS) : Promise<Alert[]> {
        if (!notices || Date.now() - noticesFetched > 300000) {
            noticesFetched = Date.now();
            const since = Math.floor(Date.now() / 1000) - 30 * 86400;
            notices = fetch(PEAK_URL.replace("&action=list", "") + `Fcm_notifications&action=since&agency_id=88&topic=alerts&created=${since}`)
                .then(response => response.json())
                .then(data => (data.fcm_notifications ?? []).map((n: any) => ({
                    id: "peak-" + n.id,
                    header: n.body ? `${n.title}: ${n.body}` : n.title,
                    description: n.body,
                    title: n.title,
                    routes: [...new Set<string>((n.title + " " + n.body).match(/12[0-6]/g) ?? [])],
                    created: n.created,
                    end: n.display_end,
                })))
                .catch(() => []);
        }
        const now = Date.now() / 1000;
        return (await notices)
            .filter((n: any) => (n.end ? n.end > now : n.created > now - days * 86400))
            .filter((n: Alert) => !routeIds || n.routes.some(route => routeIds.has(route)))
            .sort((a: Alert, b: Alert) => (b.created ?? 0) - (a.created ?? 0));
    }

    /**
     * Adds AM/PM to clock-time departures ("1:12" -> "1:12 PM"); "5 Min" and "Due" stay as they are
     * @param text  departure text from Metro Transit
     * @param time  departure time in epoch seconds
     */
    export function formatDeparture(text: string, time: number) : string {
        if (!/^\d{1,2}:\d{2}$/.test(text) || !time) return text;
        return new Date(time * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }

    /**
     * Estimated walking minutes for a distance
     * @param meters distance in meters
     */
    export function walkMinutes(meters: number) : number {
        // Street paths run ~30% longer than a straight line; walking is ~80 m per minute
        return Math.max(1, Math.round(meters * 1.3 / 80));
    }

    /* Private */

    const PEAK_URL = `https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=${process.env.REACT_APP_PEAK_KEY}&action=list&agencyID=88&controller=`;

    let stops : Promise<Array<[string, string, number, number]>> | undefined;
    let stopNames : Map<string, string> | undefined;
    let stopCoords : Map<string, [number, number]> | undefined;
    const patterns = new Map<string, Promise<{ patterns: string[][], trips: Record<string, number> } | undefined>>();
    let peakStops : Promise<Map<any, any>> | undefined;
    let alerts : Promise<Alert[]> | undefined;
    let alertsFetched = 0;
    let peakEtas : Promise<Map<any, any>> | undefined;
    let peakRouteStops : Promise<any[]> | undefined;
    let peakEtasFetched = 0;
    let notices : Promise<any[]> | undefined;
    let noticesFetched = 0;
    // Campus notices have no end date, so only recent ones are shown
    const NOTICE_DAYS = 3;
    let positions : Promise<Map<string, any>> | undefined;
    let positionsFetched = 0;

    let updates : Promise<Map<string, any[]>> | undefined;
    let updatesFetched = 0;

    /**
     * Maps trip IDs to each Metro Transit vehicle's current stop, status and bus number, refreshed every 15 seconds
     */
    function getMetroPositions() : Promise<Map<string, { stopId?: string, stopped: boolean, label?: string, lat?: number, lng?: number }>> {
        if (!positions || Date.now() - positionsFetched > 15000) {
            positionsFetched = Date.now();
            positions = fetch("https://svc.metrotransit.org/mtgtfs/vehiclepositions.pb")
                .then(response => response.arrayBuffer())
                .then(buffer => new Map(GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)).entity
                    .filter(entity => entity.vehicle?.trip?.tripId)
                    .map(entity => [entity.vehicle?.trip?.tripId as string, {
                        stopId: entity.vehicle?.stopId ?? undefined,
                        stopped: entity.vehicle?.currentStatus === GtfsRealtimeBindings.transit_realtime.VehiclePosition.VehicleStopStatus.STOPPED_AT,
                        label: entity.vehicle?.vehicle?.label ?? undefined,
                        lat: entity.vehicle?.position?.latitude ?? undefined,
                        lng: entity.vehicle?.position?.longitude ?? undefined,
                    }])))
                .catch(() => new Map());
        }
        return positions as Promise<Map<string, any>>;
    }

    /**
     * Maps trip IDs to their predicted stop times, refreshed every 15 seconds
     */
    function getMetroUpdates() : Promise<Map<string, any[]>> {
        if (!updates || Date.now() - updatesFetched > 15000) {
            updatesFetched = Date.now();
            updates = fetch("https://svc.metrotransit.org/mtgtfs/tripupdates.pb")
                .then(response => response.arrayBuffer())
                .then(buffer => new Map(GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)).entity
                    .filter(entity => entity.tripUpdate?.trip?.tripId)
                    .map(entity => [entity.tripUpdate?.trip?.tripId as string, entity.tripUpdate?.stopTimeUpdate ?? []])))
                .catch(() => new Map());
        }
        return updates;
    }

    /**
     * Gets a route's stop patterns (ordered stop lists) and the pattern each trip follows
     */
    function getPatterns(routeId: string) : Promise<{ patterns: string[][], trips: Record<string, number> } | undefined> {
        if (!patterns.has(routeId))
            patterns.set(routeId, fetch(process.env.PUBLIC_URL + "/gtfs/patterns/" + routeId + ".json")
                .then(response => response.ok ? response.json() : undefined)
                .catch(() => undefined));
        return patterns.get(routeId)!;
    }

    /**
     * Finds the next stop of a trip from the bus's location: the end of the stop-to-stop segment nearest the bus.
     * Only segments up to the feed's reported stop are searched, so loops that pass the same spot twice resolve correctly.
     * @param feedStopId the feed's next stop, an upper bound on how far along the trip the bus is
     * @returns the next stop, and whether the bus is at it
     */
    async function locateOnTrip(routeId: string, tripId: string, position: { lat?: number, lng?: number } | undefined, feedStopId?: string)
        : Promise<{ stopId: string, at: boolean } | undefined> {
        if (position?.lat === undefined || position?.lng === undefined) return undefined;
        const [data, all] = await Promise.all([getPatterns(routeId), getStops()]);
        const pattern = data?.patterns[data.trips[tripId]];
        if (!pattern?.length) return undefined;
        if (!stopCoords) stopCoords = new Map(all.map(stop => [stop[0], [stop[2], stop[3]]]));
        const coords = pattern.map(id => stopCoords!.get(id));
        if (coords.some(c => !c)) return undefined;
        const { lat, lng } = position;
        const feedIndex = feedStopId ? pattern.indexOf(feedStopId) : -1;
        // Feed says the trip hasn't started: the bus is waiting to begin at the first stop
        if (feedIndex === 0) return { stopId: pattern[0], at: distance(lat, lng, coords[0]![0], coords[0]![1]) < 40 };
        const last = feedIndex > 0 ? feedIndex : pattern.length - 1;

        // At a stop: within 40 m of one
        for (let i = 0; i <= last; i++)
            if (distance(lat, lng, coords[i]![0], coords[i]![1]) < 40) return { stopId: pattern[i], at: true };

        let best = -1, bestDistance = Infinity;
        for (let i = 1; i <= last; i++) {
            const d = segmentDistance(lat, lng, coords[i - 1]!, coords[i]!);
            if (d < bestDistance) { bestDistance = d; best = i; }
        }
        // Far from the route (detour, deadheading): trust the feed instead
        return best > 0 && bestDistance < 300 ? { stopId: pattern[best], at: false } : undefined;
    }

    /**
     * Meters from a point to the straight segment between two [lat, lng] points
     */
    function segmentDistance(lat: number, lng: number, a: [number, number], b: [number, number]) : number {
        const toRad = Math.PI / 180, scale = Math.cos(lat * toRad);
        const bx = (b[1] - a[1]) * scale, by = b[0] - a[0];
        const px = (lng - a[1]) * scale, py = lat - a[0];
        const lengthSq = bx * bx + by * by;
        const t = lengthSq ? Math.max(0, Math.min(1, (px * bx + py * by) / lengthSq)) : 0;
        return distance(lat, lng, a[0] + t * by, a[1] + t * bx / scale);
    }

    /**
     * Distance in meters between two points
     */
    function distance(lat1: number, lng1: number, lat2: number, lng2: number) : number {
        const toRad = Math.PI / 180;
        const x = (lng2 - lng1) * toRad * Math.cos((lat1 + lat2) / 2 * toRad);
        const y = (lat2 - lat1) * toRad;
        return Math.sqrt(x * x + y * y) * 6371000;
    }
}

export default Live;
