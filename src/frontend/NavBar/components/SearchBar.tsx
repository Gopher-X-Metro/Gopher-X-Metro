import { ControlPosition, MapControl, useMap } from "@vis.gl/react-google-maps";
import React, { useRef } from "react";
import Plan from "src/backend/Plan";
import Routes from "src/frontend/Pages/Map/components/Routes";
import Search from "src/frontend/Pages/Map/elements/Search";

const searches = new Map<string, Search>();

export default function SearchBar( { isMobile } ) {
    const input = useRef(null);
    const map = useMap("map");

    if (input.current && map) {
        const autocomplete = new google.maps.places.Autocomplete(input.current, { fields: ["place_id", "geometry", "name", "formatted_address"] });
        const geocoder = new google.maps.Geocoder();

        autocomplete.bindTo("bounds", map);
     
        autocomplete.addListener("place_changed", () => onPlaceChange(map, autocomplete, geocoder));
    }

    return (
        <>
            <MapControl position={ControlPosition.TOP_CENTER}>
                <input id="search-bar" className={"search-controls" + (isMobile ? "-mobile" : "")} type="text" ref={input}/>
            </MapControl>
        </>
    )
}

/**
     * Sets the new location of the marker, and focuses on the spot
     */
function onPlaceChange(map : google.maps.Map, autocomplete : google.maps.places.Autocomplete, geocoder : google.maps.Geocoder) : void {
    const place = autocomplete.getPlace();

    if (!place.place_id) return;

    if (searches.has(place.place_id)) {
        searches.get(place.place_id)?.setVisible(true);
    } else {
        geocoder
        .geocode({ placeId: place.place_id })
        .then(async ({ results }) => {
            const location = results[0].geometry.location;

            searches.set(place.place_id as string, new Search(place.place_id as string, place.name, location, map));

            map.setZoom(15);
            map.setCenter(location);

            Plan.serviceNearby(location.lat(), location.lng(), null, 0, 0.3).then(async nearest => {
                if (nearest.version !== 0) {
                    for (const stop of nearest.atstop) {
                        Routes.loadStop(stop.stopid, "").then(s => {
                            if (s) searches.get(place.place_id as string)?.addElement(s);
                            s?.addElement(searches.get(place.place_id as string) as Search);
                            s?.updateVisibility();
                        });
                    }
                }
            })
        }).catch((error) => window.alert("Geocoder failed due to: " + error));
    }
}