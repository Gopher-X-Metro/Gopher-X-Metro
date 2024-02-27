// User Location Marker
namespace Marker { 

    /* Public */

    /**
     * Initalizes the marker on the map
     * @param map map the user marker will display on
     */
    export function init(_map: google.maps.Map) : void {
        this.map = _map;
        marker = new window.google.maps.marker.AdvancedMarkerElement({
            map: map,
            content: new window.google.maps.marker.PinElement({background: "#fabb00"}).element
        });

        // Centers at User Location
        navigator.geolocation.getCurrentPosition(position => { 
            if (map && position.coords.accuracy < 1000) // If accuraccy is too low, don't center
                map.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude })
        })
    }
    /**
     * Updates the user's location
     */
    export function update() : void {
        navigator.geolocation.getCurrentPosition(position => { 
            marker.position = { lat: position.coords.latitude, lng: position.coords.longitude }
            marker.map = position.coords.accuracy < 1000 ? this.map : null // If accuraccy is too low, don't display
        })
    }

    /* Private */

    let marker : google.maps.marker.AdvancedMarkerElement;
    let map : google.maps.Map;
}

export default Marker;