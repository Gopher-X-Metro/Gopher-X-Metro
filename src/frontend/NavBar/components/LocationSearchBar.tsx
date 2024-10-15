import { ControlPosition, MapControl, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import React, { useEffect, useRef, useState } from "react";
import Plan from "src/backend/Plan";
import Routes from "src/frontend/Pages/Map/components/Routes";
import Search from "src/frontend/Pages/Map/elements/Search";
import { centerMap } from "src/frontend/Pages/Map/Map";

const searches = new Map<string, Search>();

export default function LocationSearchBar( { isMobile } ) {
    const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const places = useMapsLibrary('places');
    
    const map = useMap("map");

    useEffect(() => {
        if (!places || !inputRef.current) return;

        const options = { 
            fields: ['place_id', 'geometry', 'name', 'formatted_address'],
            componentRestrictions: { country: "us" } 
        };

        setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
    }, [places]);

    useEffect(() => {
        if (!placeAutocomplete || !map) return;

        placeAutocomplete.bindTo("bounds", map);

        placeAutocomplete.addListener('place_changed', () => onPlaceSelect(map, placeAutocomplete.getPlace()));
    }, [onPlaceSelect, placeAutocomplete]);

    return (
        <>
            <MapControl position={isMobile ? ControlPosition.BOTTOM_CENTER : ControlPosition.TOP_CENTER}>
                <input id="location-search-bar" className={"location-search-bar" + (isMobile ? " mobile" : "")} type="text" ref={inputRef}/>
            </MapControl>
        </>
    )
}

/**
     * Sets the new location of the marker, and focuses on the spot
     */
function onPlaceSelect(map : google.maps.Map, place : google.maps.places.PlaceResult) : void {
    console.log(place);

    if (!place || !place.place_id) return;

    const location = place.geometry?.location;

    if (!location) return;

    centerMap(map, location, 15);

    if (searches.has(place.place_id)) {
        searches.get(place.place_id)?.setVisible(true);
    } else {
        searches.set(place.place_id as string, new Search(place.place_id as string, place.name, location, map));

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
    }
}