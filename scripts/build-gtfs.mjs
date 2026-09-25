// Converts Metro Transit's static GTFS feed into small JSON files the site loads directly.
// Usage: node scripts/build-gtfs.mjs <folder with extracted gtfs .txt files>
// Output: public/gtfs/{calendar.json, stops.json, schedules/<route_id>.json, routes/<route_id>.json, shapes/<shape_id>.json}

import fs from "fs";
import path from "path";
import readline from "readline";

const source = process.argv[2];
const output = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..", "public", "gtfs");

if (!source) {
    console.error("Usage: node scripts/build-gtfs.mjs <gtfs folder>");
    process.exit(1);
}

/** Splits one CSV line, respecting quoted fields */
function parseLine(line) {
    const fields = [];
    let field = "", quoted = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (quoted) {
            if (c === '"' && line[i + 1] === '"') { field += '"'; i++; }
            else if (c === '"') quoted = false;
            else field += c;
        } else if (c === '"') quoted = true;
        else if (c === ",") { fields.push(field); field = ""; }
        else field += c;
    }
    fields.push(field);
    return fields;
}

/** Streams each row of a GTFS file as an object */
async function eachRow(file, callback) {
    const lines = readline.createInterface({ input: fs.createReadStream(path.join(source, file)), crlfDelay: Infinity });
    let header;
    for await (const line of lines) {
        if (!line.trim()) continue;
        const fields = parseLine(line);
        if (!header) { header = fields.map(h => h.replace(/^﻿/, "")); continue; }
        callback(Object.fromEntries(header.map((h, i) => [h, fields[i]])));
    }
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(path.join(output, "routes"), { recursive: true });
fs.mkdirSync(path.join(output, "shapes"), { recursive: true });

// Calendar
const calendar = [], dates = [];
await eachRow("calendar.txt", row => calendar.push(row));
await eachRow("calendar_dates.txt", row => dates.push(row));
fs.writeFileSync(path.join(output, "calendar.json"), JSON.stringify({ calendar, dates }));

// Stops as [stop_id, name, lat, lon] for the nearby-stops list
const stops = [];
await eachRow("stops.txt", row => {
    if (!row.location_type || row.location_type === "0")
        stops.push([row.stop_id, row.stop_name, Number(Number(row.stop_lat).toFixed(5)), Number(Number(row.stop_lon).toFixed(5))]);
});
fs.writeFileSync(path.join(output, "stops.json"), JSON.stringify(stops));

// Routes and the unique service/shape pairs of their trips
const routes = new Map();
const tripInfo = new Map();
await eachRow("routes.txt", row => routes.set(row.route_id, { route: row, trips: new Map() }));
await eachRow("trips.txt", row => {
    routes.get(row.route_id)?.trips.set(row.service_id + "|" + row.shape_id, { service_id: row.service_id, shape_id: row.shape_id });
    tripInfo.set(row.trip_id, { route: row.route_id, service: row.service_id, direction: row.direction || row.direction_id, headsign: row.trip_headsign });
});
for (const [routeId, { route, trips }] of routes)
    fs.writeFileSync(path.join(output, "routes", routeId + ".json"), JSON.stringify({ route, trips: [...trips.values()] }));

// Schedules: for a sample weekday, Saturday and Sunday, when each route runs and how often
const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const ymd = d => d.toISOString().slice(0, 10).replace(/-/g, "");
function sampleDate(dayIndex) {
    // The next matching day that isn't a holiday-style exception for most services
    const d = new Date();
    for (let i = 0; i < 21; i++, d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== dayIndex) continue;
        const date = ymd(d);
        if (dates.filter(x => x.date === date).length < 5) return date;
    }
    return ymd(d);
}
function runs(service, date) {
    const exception = dates.find(x => x.service_id === service && x.date === date);
    if (exception) return exception.exception_type === "1";
    const c = calendar.find(x => x.service_id === service);
    return !!c && c.start_date <= date && date <= c.end_date && c[days[new Date(date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6) + "T12:00").getDay()]] === "1";
}
const firstStop = new Map(); // trip_id -> [sequence, seconds]
await eachRow("stop_times.txt", row => {
    const seq = Number(row.stop_sequence), current = firstStop.get(row.trip_id);
    if (!current || seq < current[0]) {
        const [h, m] = row.departure_time.split(":").map(Number);
        firstStop.set(row.trip_id, [seq, h * 3600 + m * 60]);
    }
});
const dayTypes = { Weekday: sampleDate(3), Saturday: sampleDate(6), Sunday: sampleDate(0) };
const schedules = new Map();
for (const [tripId, info] of tripInfo) {
    const start = firstStop.get(tripId);
    if (!start) continue;
    for (const [dayType, date] of Object.entries(dayTypes)) {
        if (!runs(info.service, date)) continue;
        const route = schedules.get(info.route) ?? {};
        const key = info.direction;
        route[dayType] ??= {};
        route[dayType][key] ??= { headsigns: {}, starts: [] };
        route[dayType][key].starts.push(start[1]);
        route[dayType][key].headsigns[info.headsign] = (route[dayType][key].headsigns[info.headsign] ?? 0) + 1;
        schedules.set(info.route, route);
    }
}
/** Groups trip start times into spans that share a similar frequency */
function spans(starts) {
    starts.sort((a, b) => a - b);
    const round = gap => gap <= 12 ? Math.round(gap) : Math.round(gap / 5) * 5;
    const out = [];
    for (let i = 0; i < starts.length; i++) {
        const gap = i + 1 < starts.length ? round((starts[i + 1] - starts[i]) / 60) : null;
        const last = out[out.length - 1];
        if (last && gap !== null && last.every !== null && Math.abs(last.every - gap) <= Math.max(2, last.every * 0.25) && gap <= 90) {
            last.to = starts[i + 1];
            last.gaps.push(gap);
        } else if (gap !== null && gap <= 90) out.push({ from: starts[i], to: starts[i + 1], every: gap, gaps: [gap] });
        else if (!last || last.to !== starts[i]) out.push({ from: starts[i], to: starts[i], every: null, gaps: [] });
    }
    return out.map(span => {
        const median = span.gaps.length ? span.gaps.sort((a, b) => a - b)[Math.floor(span.gaps.length / 2)] : null;
        return [span.from, span.to, median];
    });
}
fs.mkdirSync(path.join(output, "schedules"), { recursive: true });
for (const [routeId, route] of schedules) {
    const out = {};
    for (const [dayType, directions] of Object.entries(route))
        out[dayType] = Object.entries(directions).map(([direction, d]) => ({
            direction,
            headsign: Object.entries(d.headsigns).sort((a, b) => b[1] - a[1])[0][0],
            trips: d.starts.length,
            spans: spans(d.starts),
        }));
    fs.writeFileSync(path.join(output, "schedules", routeId + ".json"), JSON.stringify(out));
}

// Shapes as ordered [lat, lon] points
const shapes = new Map();
await eachRow("shapes.txt", row => {
    if (!shapes.has(row.shape_id)) shapes.set(row.shape_id, []);
    shapes.get(row.shape_id).push([Number(row.shape_pt_sequence), Number(row.shape_pt_lat), Number(row.shape_pt_lon)]);
});
for (const [shapeId, points] of shapes)
    fs.writeFileSync(path.join(output, "shapes", shapeId + ".json"), JSON.stringify(points.sort((a, b) => a[0] - b[0]).map(p => [p[1], p[2]])));

console.log(`Wrote ${routes.size} routes and ${shapes.size} shapes to ${output}`);
