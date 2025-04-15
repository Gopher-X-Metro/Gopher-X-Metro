import { ControlPosition, MapControl, useMap } from "@vis.gl/react-google-maps";
import React, { useEffect, useRef } from "react";
import Plan from "src/backend/Plan";
import Routes from "src/frontend/Pages/Map/components/Routes";
import Search from "src/frontend/Pages/Map/elements/Search";

const searches = new Map<string, Search>();

/**
 * LocationSearchBar Component
 * 
 * Search Bar for specific locations based on user input.
 * Location Search Bar displays differently based on if user is on
 * mobile or not
 * 
 * @returns rendered LocationSearchBar component
 */
export default function LocationSearchBar({ isMobile }) {
    const input = useRef<HTMLInputElement>(null);
    const map = useMap("map");

    useEffect(() => {
        if (input.current && map) {
            // As of March 1st, 2025, google.maps.places.Autocomplete is not available to new customers
            // As a replacement we are using google.maps.places.PlaceAutocompleteElement instead
            (async () => {
                const placesLib = (await google.maps.importLibrary("places")) as any;
                const PlaceAutocompleteElement: typeof google.maps.places.PlaceAutocompleteElement = placesLib.PlaceAutocompleteElement;
                const autocomplete = new PlaceAutocompleteElement({
                    inputElement: input.current!,
                    locationBias: map.getBounds() || undefined
                });
                const geocoder = new google.maps.Geocoder();
    
                autocomplete.addEventListener("place_changed", async (event) => {
                    const selectEvent = event as unknown as google.maps.places.PlaceAutocompletePlaceSelectEvent;
                    let place = selectEvent.place;

                    if (!place.location) {
                        try {
                            await place.fetchFields({
                                fields: ["place_id", "geometry", "name", "formatted_address"],
                            }).then((detailsResponse: { place: google.maps.places.Place }) => {
                                place = detailsResponse.place;
                            });
                        } catch (e) {
                            window.alert("Failed to fetch detailed place data: " + e);
                            return;
                        }
                    }
                    onPlaceChange(map, place, geocoder)
                });
            })();
        }
    }, [input, map]);

    return (
        <>
            <MapControl position={isMobile ? ControlPosition.BOTTOM_CENTER : ControlPosition.TOP_CENTER}>
                <input id="location-search-bar" className={"location-search-bar" + (isMobile ? " mobile" : "")} type="text" ref={input} placeholder="Enter a location" />
            </MapControl>
        </>
    );
}

/* Private Helper Methods */

/**
 * Sets new location of marker and focuses on the spot
 */
function onPlaceChange(map : google.maps.Map, place : google.maps.places.Place, geocoder : google.maps.Geocoder) : void {
    if (!place.id) return;

    if (searches.has(place.id)) {
        searches.get(place.id)?.setVisible(true);
    } else {
        geocoder
        .geocode({ placeId: place.id })
        .then(async ({ results }) => {
            const location = results[0].geometry.location;

            searches.set(place.id as string, new Search(place.id as string, place.displayName || "", location, map));

            map.setZoom(15);
            map.setCenter(location);

            Plan.serviceNearby(location.lat(), location.lng(), null, 0, 0.3).then(async nearest => {
                if (nearest.version !== 0) {
                    for (const stop of nearest.atstop) {
                        Routes.loadStop(stop.stopid, "").then(s => {
                            if (s) searches.get(place.id as string)?.addElement(s);
                            s?.addElement(searches.get(place.id as string) as Search);
                            s?.updateVisibility();
                        });
                    }
                }
            });
        }).catch((error) => window.alert("Geocoder failed due to: " + error));
    }
}