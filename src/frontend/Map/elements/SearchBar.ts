import Routes from "../Routes";
import Plan from "../../../backend/Plan";

namespace SearchBar {
    /**
     * Initalizes the search bar in map
     * @param _map map object
     */
    export function init(_map: google.maps.Map) : void {
        map = _map;
        input = document.getElementById("search-bar") as HTMLInputElement;

        autocomplete = new google.maps.places.Autocomplete(input, { fields: ["place_id", "geometry", "name", "formatted_address"] });
        autocomplete.bindTo("bounds", map);

        map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

        geocoder = new google.maps.Geocoder();
        marker = new google.maps.marker.AdvancedMarkerElement({
            map: map,
            content: new window.google.maps.marker.PinElement({scale: 0.8}).element
        });

        autocomplete.addListener("place_changed", () => onPlaceChange());
    }

    /* Private */
    let marker: google.maps.marker.AdvancedMarkerElement;
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

        geocoder
        .geocode({ placeId: place.place_id })
        .then(async ({ results }) => {
            const location = results[0].geometry.location;

            map.setZoom(15);
            map.setCenter(location);

            marker.position = location;

            Plan.serviceNearby(location.lat(), location.lng(), null, 0, 0.3).then(nearest => {
                if (nearest.version !== 0)
                    for (const stop of nearest.atstop)
                        Routes.loadStop(stop.stopid, "");
            })

            console.log(await Plan.serviceNearby(location.lat(), location.lng(), null, 0, 0.3));
            console.log(await Plan.nearestLandmark(location.lat(), location.lng(), null, 3, 10, null));
            console.log(await Plan.nearestParkAndRides(location.lat(), location.lng(), null, 1));

        }).catch((e) => window.alert("Geocoder failed due to: " + e));
    }
}


export default SearchBar;