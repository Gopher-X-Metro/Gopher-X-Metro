import Routes from "src/frontend/Pages/Map/components/Routes";
import Plan from "src/backend/Plan";
import Search from "src/frontend/Pages/Map/elements/Search";

/* Currently not being used */

/**
 * SearchBar Component
 * 
 * Creates a search bar on the map
 * @returns rendered SearchBar component
 */
namespace SearchBar {
    const searches = new Map<string, Search>();
    let input: HTMLInputElement;
    let autocomplete: google.maps.places.PlaceAutocompleteElement;
    let geocoder: google.maps.Geocoder;
    let map: google.maps.Map;

    /* Private Helper Methods*/

    /**
     * Sets new location of marker and focuses on the spot
     */
    function onPlaceChange(event: Event) : void {
        const selectEvent = event as unknown as google.maps.places.PlaceAutocompletePlaceSelectEvent;
        const place = selectEvent.place;

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

    /* Deprecated / Unused */

    /**
     * Initalizes search bar in map
     * @param _map map object
     * @deprecated
     */
    async function init(_map: google.maps.Map) : Promise<void> {
        map = _map;

        input = document.getElementById("search-bar") as HTMLInputElement;
        input.className = "search-controls" + (false ? "-mobile" : "")

        const placesLib = (await google.maps.importLibrary("places")) as any;
        const PlaceAutocompleteElement: typeof google.maps.places.PlaceAutocompleteElement = placesLib.PlaceAutocompleteElement;

        autocomplete = new PlaceAutocompleteElement({
            inputElement: input,
            locationBias: map.getBounds() || undefined
        });

        geocoder = new google.maps.Geocoder();
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
        autocomplete.addEventListener("place_changed", onPlaceChange);
    }
}

export default SearchBar;