import { getCachedJSON } from "src/backend/Fetch.ts";

/**
 * Past-run delay history for Metro Transit trips, read from the static JSON published by
 * https://kennedyjohnson.github.io/metro-transit-delays/ (read-only; that repo owns the format).
 *
 * Trip IDs from the vehicle feed match the published trip IDs (GTFS trip_id). Every failure resolves to
 * undefined, so a missing or stale file just means no prediction is shown.
 */
namespace Predictions {
    /** How a trip has run on this kind of day, from its past runs */
    export interface Prediction {
        /** typical delay in minutes (negative means early) */
        minutes: number;
        /** share of past runs that were 5+ minutes late, 0 to 1 */
        late: number;
        /** past runs behind these numbers */
        runs: number;
        risk: "late" | "on-time";
    }

    /** Whether the map shows the prediction dots (the popup line is always shown when there is data) */
    let shown = true;
    export function isShown() : boolean { return shown; }
    export function setShown(on: boolean) : void { shown = on; }

    /**
     * Gets the past-run prediction for a Metro Transit trip
     * @param routeId route the trip runs on
     * @param tripId  GTFS trip ID from the vehicle feed
     * @returns the prediction, or undefined when there's no usable history or the data can't be loaded
     */
    export async function forTrip(routeId: string, tripId: string) : Promise<Prediction | undefined> {
        try {
            const [meta, routes] = await Promise.all([json("meta.json"), json("routes.json")]);
            // Ignore the history if the publisher hasn't refreshed it recently
            if (!meta?.updated || !(Date.now() - Date.parse(meta.updated) <= MAX_AGE_MS)) return undefined;
            const file = routes?.routes?.find((r: any) => r.id === routeId)?.file;
            if (!file) return undefined;

            const body = await json(`routes/${file}.json`);
            const h = body && tripIndex(body).get(tripId)?.h?.[daytype()];
            if (!h || h[3] < MIN_RUNS) return undefined;

            const [minutes, late, , runs] = h as number[];
            return { minutes, late, runs, risk: late >= LATE_RISK ? "late" : "on-time" };
        } catch {
            return undefined;
        }
    }

    /* Private */
    const BASE = "https://kennedyjohnson.github.io/metro-transit-delays/data/";
    const HOUR = 60 * 60 * 1000;
    const MAX_AGE_MS = 3 * 24 * HOUR;   // ignore history that hasn't refreshed in 3 days
    const MIN_RUNS = 10;                // past runs of this trip needed before showing anything
    const LATE_RISK = 0.3;              // flag a trip when 30%+ of its past runs were 5+ min late
    const ZONE = "America/Chicago";
    const json = (path: string) => getCachedJSON(BASE + path, HOUR);

    /** Trip lookup per published route file, built once per loaded file */
    const indexes = new WeakMap<object, Map<string, any>>();
    function tripIndex(body: any) : Map<string, any> {
        let index = indexes.get(body);
        if (!index) {
            index = new Map();
            for (const dir of Object.values<any>(body.dirs ?? {}))
                for (const trip of dir.trips ?? []) index.set(trip.id, trip);
            indexes.set(body, index);
        }
        return index;
    }

    /** The published day types, using the Chicago calendar the publisher uses */
    function daytype() : "wk" | "sat" | "sun" {
        const day = new Intl.DateTimeFormat("en-US", { timeZone: ZONE, weekday: "short" }).format(new Date());
        return day === "Sat" ? "sat" : day === "Sun" ? "sun" : "wk";
    }
}

export default Predictions;
