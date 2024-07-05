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
        .then(({ results }) => {
            map.setZoom(15);
            map.setCenter(results[0].geometry.location);

            marker.position = results[0].geometry.location;
        }).catch((e) => window.alert("Geocoder failed due to: " + e));
    }
}


export default SearchBar;