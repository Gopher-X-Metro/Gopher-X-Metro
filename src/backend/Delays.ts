import { getCachedJSON } from "src/backend/Fetch.ts";
import Live from "src/backend/Live.ts";

/**
 * Planning estimates for scheduled (not yet tracked) Metro Transit departures, from the model published by
 * https://kennedyjohnson.github.io/metro-transit-delays/ (github.com/KennedyJohnson/metro-transit-delays).
 *
 * Only flags a departure when the model is confident: live (📡) departures already include their delay, and
 * anything uncertain, stale or unavailable shows nothing. featureRow() and TreeModel mirror that repo's
 * docs/features.js and docs/model.js; keep them in sync.
 */
namespace Delays {
    export interface Estimate {
        kind: "late" | "early";
        text: string;
        title: string;
    }

    /** Estimates for a stop's departures, by trip ID. Never throws; returns an empty map on any problem. */
    export async function estimates(stopId: string, departures: Live.Departure[]) : Promise<Map<string, Estimate>> {
        const out = new Map<string, Estimate>();
        try {
            const scheduled = departures.filter(d => !d.actual && d.tripId && d.time);
            if (!scheduled.length) return out;
            // meta.json is tiny; only fetch the rest once the model exists and is fresh
            const meta = await json("meta.json");
            if (!meta?.model || !(Date.now() - Date.parse(meta.updated) <= MAX_AGE_MS)) return out;
            const [cal, routes] = await Promise.all([json("calendar.json"), json("routes.json")]);
            if (!cal?.services || !routes?.routes) return out;

            for (const d of scheduled) {
                const route = routes.routes.find((r: any) => r.id === d.routeId);
                if (!route) continue;
                const body = await json(`routes/${route.file}.json`);
                const match = body && findTrip(body, d.tripId, stopId, d.time, cal.services);
                if (!match) continue;
                const { dirId, trip, col, date } = match;
                const history = trip.h?.[daytype(dayOfWeek(date))];
                if (!history || history[3] < MIN_TRIP_OBS) continue; // not enough history for this exact trip

                const models = await loadModels();
                if (!models) return out;
                const dir = route.dirs.find((x: any) => String(x.id) === dirId) ?? {};
                const row = featureRow({ dateStr: date, dir, trip, col, stopMean: body.dirs[dirId].stops[col][2],
                                         meta, holidays: cal.holidays ?? [], weather: await weather() });
                const median = models.median.predict(row), late = models.late.predict(row), early = models.early.predict(row);
                const minutes = Math.round(median);
                if (late >= LATE_P && minutes >= LATE_MIN)
                    out.set(d.tripId, { kind: "late", text: `usually ~${minutes} min late`,
                        title: `Scheduled time. This trip has run 5+ min late ${Math.round(late * 100)}% of the time (typically ~${minutes} min).` });
                else if (early >= EARLY_P)
                    out.set(d.tripId, { kind: "early", text: "may leave early",
                        title: `Scheduled time. This trip has left early ${Math.round(early * 100)}% of the time; be at the stop a few minutes before.` });
            }
        } catch (e) {
            console.warn("Delay estimates unavailable:", e);
        }
        return out;
    }

    /* Private */

    const BASE = "https://kennedyjohnson.github.io/metro-transit-delays/data/";
    const HOUR = 60 * 60 * 1000;
    const MAX_AGE_MS = 3 * 24 * HOUR;   // ignore the model if its data hasn't refreshed in 3 days
    const MIN_TRIP_OBS = 10;            // times this exact trip has been observed
    const LATE_P = 0.6, LATE_MIN = 3;   // flag late: 60%+ chance of 5+ min late, and typically 3+ min
    const EARLY_P = 0.3;                // flag early: 30%+ chance it leaves 1+ min early
    const WX = ["temperature_2m", "precipitation", "snowfall", "wind_speed_10m"];
    const ZONE = "America/Chicago";

    const json = (path: string) => getCachedJSON(BASE + path, HOUR);

    let models: Promise<{ median: TreeModel, late: TreeModel, early: TreeModel } | null> | undefined;
    function loadModels() {
        models ??= Promise.all(["median", "late", "early"].map(k => json(`model_${k}.json`)))
            .then(([m, l, e]) => m && l && e ? { median: new TreeModel(m), late: new TreeModel(l), early: new TreeModel(e) } : null);
        return models;
    }

    async function weather() : Promise<Record<string, Record<string, number>> | null> {
        const q = `latitude=44.98&longitude=-93.27&timezone=${encodeURIComponent(ZONE)}&forecast_days=3&hourly=${WX.join(",")}`;
        const j = await getCachedJSON(`https://api.open-meteo.com/v1/forecast?${q}`, HOUR);
        if (!j?.hourly?.time) return null;
        const out: Record<string, Record<string, number>> = {};
        j.hourly.time.forEach((t: string, i: number) => { out[t] = Object.fromEntries(WX.map(k => [k, j.hourly[k][i]])); });
        return out;
    }

    /** Local (Chicago) date "YYYY-MM-DD" and minutes after midnight for an epoch-seconds time */
    function localParts(epoch: number) : { date: string, minutes: number } {
        const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: ZONE, year: "numeric", month: "2-digit",
            day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(epoch * 1000)).map(x => [x.type, x.value]));
        return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
    }

    function shiftDate(date: string, days: number) : string {
        const [y, m, d] = date.split("-").map(Number);
        return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
    }

    function dayOfWeek(date: string) : number {
        const [y, m, d] = date.split("-").map(Number);
        return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
    }

    const daytype = (dow: number) => dow < 5 ? "wk" : dow === 5 ? "sat" : "sun";

    /** The trip in the published schedule, the stop's column and the service day this departure belongs to */
    function findTrip(body: any, tripId: string, stopId: string, epoch: number, services: Record<string, string[]>) {
        const { date, minutes } = localParts(epoch);
        for (const [dirId, dir] of Object.entries<any>(body.dirs)) {
            const trip = dir.trips.find((t: any) => t.id === tripId);
            if (!trip) continue;
            const col = dir.stops.findIndex((s: any) => s[0] === stopId);
            if (col < 0 || trip.t[col] == null) return null;
            // after-midnight trips belong to the previous service day (their times run past 24:00)
            for (const [day, m] of [[date, minutes], [shiftDate(date, -1), minutes + 1440]] as [string, number][]) {
                if (Math.abs(trip.t[col] - m) <= 2 && services[day]?.includes(body.svc[trip.s]))
                    return { dirId, trip, col, date: day };
            }
            return null;
        }
        return null;
    }

    /** Mirror of metro-transit-delays docs/features.js featureRow() */
    function featureRow({ dateStr, dir, trip, col, stopMean, meta, holidays, weather }: any) : Record<string, number> {
        const dow = dayOfWeek(dateStr);
        const g = meta.global;
        const idx = trip.t.map((v: number | null, i: number) => (v == null ? -1 : i)).filter((i: number) => i >= 0);
        const stopIdx = idx.indexOf(col);
        const schedMin = trip.t[col];
        const rdMean = dir.mean ?? g.delay_min, rdLate = dir.late ?? g.late, rdEarly = dir.early ?? g.early;
        const h = trip.h?.[daytype(dow)];
        const row: Record<string, number> = {
            hour: (schedMin / 60) % 24,
            dow,
            holiday: holidays.includes(dateStr) ? 1 : 0,
            progress: stopIdx / Math.max(idx.length - 1, 1),
            stop_idx: stopIdx,
            start_hour: trip.start / 60,
            rd_mean: rdMean, rd_late: rdLate, rd_early: rdEarly,
            trip_mean: h ? h[0] : rdMean, trip_late: h ? h[1] : rdLate, trip_early: h ? h[2] : rdEarly,
            trip_n: Math.log1p(h ? h[3] : 0),
            stop_mean: stopMean ?? rdMean,
            recent7: dir.recent7 ?? NaN,
        };
        const [y, m, d] = dateStr.split("-").map(Number);
        const t = new Date(Date.UTC(y, m - 1, d) + Math.floor(schedMin / 60) * 3600e3).toISOString().slice(0, 13) + ":00";
        const w = weather?.[t];
        for (const k of WX) row[k] = w && w[k] != null ? w[k] : NaN;
        return row;
    }

    /** Mirror of metro-transit-delays docs/model.js: exported LightGBM trees */
    class TreeModel {
        kind: string;
        features: string[];
        trees: number[][][];
        constructor({ kind, features, trees }: any) { this.kind = kind; this.features = features; this.trees = trees; }

        predict(row: Record<string, number>) : number {
            const x = this.features.map(f => (row[f] == null ? NaN : row[f]));
            let score = 0;
            for (const nodes of this.trees) {
                let i = 0;
                while (nodes[i][0] !== -1) i = goesLeft(nodes[i], x[nodes[i][0]]) ? nodes[i][4] : nodes[i][5];
                score += nodes[i][6];
            }
            return this.kind === "binary" ? 1 / (1 + Math.exp(-score)) : score;
        }
    }

    function goesLeft(node: number[], x: number) : boolean {
        const [, thr, defLeft, missing] = node;
        if (x == null || Number.isNaN(x)) {
            if (missing === 2) return !!defLeft;
            x = 0;
        }
        if (missing === 1 && Math.abs(x) < 1e-35) return !!defLeft;
        return x <= thr;
    }
}

export default Delays;
