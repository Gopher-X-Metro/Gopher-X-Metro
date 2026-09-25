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
        return {
            departures: (data?.departures ?? []).map((d: any) => ({
                routeId: d.route_id,
                routeName: d.route_short_name ?? d.route_id,
                text: d.departure_text,
                time: d.departure_time,
                actual: d.actual,
                description: d.description,
                direction: d.direction_text,
            })),
            alerts: (data?.alerts ?? []).map((a: any) => a.alert_text).filter(Boolean),
        };
    }

    /**
     * Gets the stop a Metro Transit trip is heading to next
     * @param tripId ID of the trip
     */
    export async function getMetroNextStop(tripId: string) : Promise<string | undefined> {
        const positions = await getMetroPositions();
        const stopId = positions.get(tripId);
        return stopId ? await getStopName(stopId) ?? undefined : undefined;
    }

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
                        .filter(entity => entity.alert && (entity.alert.activePeriod ?? []).some(p =>
                            Number(p.start ?? 0) <= now && (!p.end || Number(p.end) >= now)))
                        .map(entity => ({
                            id: entity.id,
                            header: entity.alert?.headerText?.translation?.[0]?.text ?? "",
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
    export async function getCampusNotices(routeIds: Set<string>) : Promise<Alert[]> {
        if (!notices || Date.now() - noticesFetched > 300000) {
            noticesFetched = Date.now();
            const since = Math.floor(Date.now() / 1000) - NOTICE_DAYS * 86400;
            notices = fetch(PEAK_URL.replace("&action=list", "") + `Fcm_notifications&action=since&agency_id=88&topic=alerts&created=${since}`)
                .then(response => response.json())
                .then(data => (data.fcm_notifications ?? []).map((n: any) => ({
                    id: "peak-" + n.id,
                    header: n.body ? `${n.title}: ${n.body}` : n.title,
                    routes: [...new Set<string>((n.title + " " + n.body).match(/12[0-6]/g) ?? [])],
                    created: n.created,
                    end: n.display_end,
                })))
                .catch(() => []);
        }
        const now = Date.now() / 1000;
        return (await notices)
            .filter((n: any) => (n.end ? n.end > now : n.created > now - NOTICE_DAYS * 86400))
            .filter((n: Alert) => n.routes.some(route => routeIds.has(route)));
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

    const PEAK_URL = "https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&action=list&agencyID=88&controller=";

    let stops : Promise<Array<[string, string, number, number]>> | undefined;
    let stopNames : Map<string, string> | undefined;
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
    let positions : Promise<Map<string, string>> | undefined;
    let positionsFetched = 0;

    /**
     * Maps trip IDs to the stop each Metro Transit vehicle is heading to, refreshed every 15 seconds
     */
    function getMetroPositions() : Promise<Map<string, string>> {
        if (!positions || Date.now() - positionsFetched > 15000) {
            positionsFetched = Date.now();
            positions = fetch("https://svc.metrotransit.org/mtgtfs/vehiclepositions.pb")
                .then(response => response.arrayBuffer())
                .then(buffer => new Map(GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)).entity
                    .filter(entity => entity.vehicle?.trip?.tripId && entity.vehicle?.stopId)
                    .map(entity => [entity.vehicle?.trip?.tripId as string, entity.vehicle?.stopId as string])))
                .catch(() => new Map());
        }
        return positions;
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
