import Routes from "src/frontend/Pages/Map/components/Routes";
import Plan from "src/backend/Plan";
import Search from "src/frontend/Pages/Map/elements/Search";

namespace SearchBar {
    /**
     * Initalizes the search bar in map
     * @param _map map object
     */
    export function init(_map: google.maps.Map) : void {
        map = _map;

        input = document.getElementById("search-bar") as HTMLInputElement;
        input.className = "search-controls" + (false ? "-mobile" : "")

        autocomplete = new google.maps.places.Autocomplete(input, { fields: ["place_id", "geometry", "name", "formatted_address"] });
        geocoder = new google.maps.Geocoder();

        autocomplete.bindTo("bounds", map);
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

        autocomplete.addListener("place_changed", () => onPlaceChange());
    }

    /* Private */
    const searches = new Map<string, Search>();
    let input: HTMLInputElement;
    let autocomplete: google.maps.places.Autocomplete;
    let geocoder: google.maps.Geocoder;
    let map: google.maps.Map;

    /**
     * Sets the new location of the marker, and focuses on the spot
     */
    function onPlaceChange() : void {
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
}


export default SearchBar;