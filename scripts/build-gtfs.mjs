// Converts Metro Transit's static GTFS feed into small JSON files the site loads directly.
// Usage: node scripts/build-gtfs.mjs <folder with extracted gtfs .txt files>
// Output: public/gtfs/{calendar.json, stops.json, routes/<route_id>.json, shapes/<shape_id>.json}

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
await eachRow("routes.txt", row => routes.set(row.route_id, { route: row, trips: new Map() }));
await eachRow("trips.txt", row => routes.get(row.route_id)?.trips.set(row.service_id + "|" + row.shape_id, { service_id: row.service_id, shape_id: row.shape_id }));
for (const [routeId, { route, trips }] of routes)
    fs.writeFileSync(path.join(output, "routes", routeId + ".json"), JSON.stringify({ route, trips: [...trips.values()] }));

// Shapes as ordered [lat, lon] points
const shapes = new Map();
await eachRow("shapes.txt", row => {
    if (!shapes.has(row.shape_id)) shapes.set(row.shape_id, []);
    shapes.get(row.shape_id).push([Number(row.shape_pt_sequence), Number(row.shape_pt_lat), Number(row.shape_pt_lon)]);
});
for (const [shapeId, points] of shapes)
    fs.writeFileSync(path.join(output, "shapes", shapeId + ".json"), JSON.stringify(points.sort((a, b) => a[0] - b[0]).map(p => [p[1], p[2]])));

console.log(`Wrote ${routes.size} routes and ${shapes.size} shapes to ${output}`);
