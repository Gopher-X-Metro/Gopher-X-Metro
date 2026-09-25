import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import Plan from "src/backend/Plan";
import Routes from "src/frontend/Pages/Map/components/Routes";
import Search from "src/frontend/Pages/Map/elements/Search";

interface Place {
    id: string;
    name: string;
    detail: string;
    location: L.LatLng;
}

const searches = new Map<string, Search>();

// Free OpenStreetMap geocoder, biased toward the Twin Cities
const PHOTON_URL = "https://photon.komoot.io/api/?limit=5&lat=44.9737&lon=-93.2317&bbox=-93.8,44.6,-92.7,45.3&q=";

export default function LocationSearchBar({ map, isMobile }: { map: L.Map | null, isMobile: boolean }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Place[]>([]);
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Keeps clicks and scrolls on the search bar from moving the map
        if (container.current) {
            L.DomEvent.disableClickPropagation(container.current);
            L.DomEvent.disableScrollPropagation(container.current);
        }
    }, [container])

    useEffect(() => {
        if (query.trim().length < 3) {
            setResults([]);
            return;
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            fetch(PHOTON_URL + encodeURIComponent(query), { signal: controller.signal })
            .then(response => response.json())
            .then(data => setResults(data.features.map((feature: any) => {
                const p = feature.properties;
                return {
                    id: `${p.osm_type}${p.osm_id}`,
                    name: p.name ?? [p.housenumber, p.street].filter(Boolean).join(" "),
                    detail: [p.name ? p.street : null, p.city].filter(Boolean).join(", "),
                    location: L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]),
                };
            })))
            .catch(() => {});
        }, 300);
        return () => { clearTimeout(timeout); controller.abort(); };
    }, [query])

    const onSelect = (place: Place) => {
        setQuery(place.name);
        setResults([]);
        if (map) onPlaceChange(map, place);
    }

    return (
        <div ref={container}
             className={"absolute z-[1000] left-1/2 -translate-x-1/2 " + (isMobile ? "bottom-[30px] w-[90%]" : "top-[80px]")}>
            <input id="location-search-bar"
                   className={"location-search-bar"}
                   style={isMobile ? { margin: 0, width: "100%" } : undefined}
                   type="text"
                   placeholder="Search for a place"
                   value={query}
                   onChange={e => setQuery(e.target.value)}
                   onKeyDown={e => { if (e.key === "Enter" && results.length > 0) onSelect(results[0]); }}/>
            {results.length > 0 && (
                <ul className={"bg-white shadow-md rounded text-sm " + (isMobile ? "absolute bottom-full w-full mb-1" : "ml-[17px] w-[400px]")}>
                    {results.map(place => (
                        <li key={place.id}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-black"
                            onClick={() => onSelect(place)}>
                            <b>{place.name}</b> <span className="text-gray-500">{place.detail}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

/**
 * Sets the new location of the marker, and focuses on the spot
 */
function onPlaceChange(map : L.Map, place : Place) : void {
    map.setView(place.location, 15);

    if (searches.has(place.id)) {
        searches.get(place.id)?.setVisible(true);
        return;
    }

    searches.set(place.id, new Search(place.id, place.name, place.location, map));

    Plan.serviceNearby(place.location.lat, place.location.lng, null, 0, 0.3).then(async nearest => {
        if (nearest.version !== 0) {
            for (const stop of nearest.atstop) {
                Routes.loadStop(stop.stopid, "").then(s => {
                    if (s) searches.get(place.id)?.addElement(s);
                    s?.addElement(searches.get(place.id) as Search);
                    s?.updateVisibility();
                });
            }
        }
    })
}
