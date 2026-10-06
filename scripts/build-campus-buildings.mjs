// Downloads named University of Minnesota buildings from OpenStreetMap (Overpass) into
// public/data/campus-buildings.json, for building labels and hover/tap names on the map.
// Run by hand when campus buildings change: node scripts/build-campus-buildings.mjs
import { writeFileSync, mkdirSync } from "node:fs";

// East Bank, West Bank and St. Paul campuses
const AREAS = [[44.966, -93.248, 44.986, -93.218], [44.978, -93.195, 44.995, -93.175]];
const query = `[out:json][timeout:60];(${AREAS.map(([s, w, n, e]) =>
    `way["building"]["name"](${s},${w},${n},${e});relation["building"]["name"](${s},${w},${n},${e});`).join("")});out geom;`;

// The main Overpass server is often busy, so fall back to a mirror
let response;
for (const server of ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]) {
    response = await fetch(server, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "gopher-x-metro build script" },
        body: "data=" + encodeURIComponent(query),
    });
    if (response.ok) break;
    console.warn(`${server}: ${response.status}`);
}
if (!response.ok) throw new Error(`Overpass ${response.status}`);
const { elements } = await response.json();

const round = n => Math.round(n * 1e5) / 1e5;
const features = [];
for (const el of elements) {
    // A relation's outer ring is its first outer member
    const ring = el.type === "way" ? el.geometry : el.members?.find(m => m.role === "outer")?.geometry;
    if (!ring || ring.length < 4) continue;
    const coords = ring.map(p => [round(p.lon), round(p.lat)]);
    features.push({
        type: "Feature",
        properties: { name: el.tags.name },
        geometry: { type: "Polygon", coordinates: [coords] },
    });
}
features.sort((a, b) => a.properties.name.localeCompare(b.properties.name));

mkdirSync("public/data", { recursive: true });
writeFileSync("public/data/campus-buildings.json", JSON.stringify({ type: "FeatureCollection", features }));
console.log(`${features.length} named buildings`);
