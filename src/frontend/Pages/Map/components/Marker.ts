import L from "leaflet";

// User Location Marker
namespace Marker { 

    /* Public */

    /**
     * Initalizes the marker on the map
     * @param _map map the user marker will display on
     */
    export function init(_map: L.Map, onCentered?: () => void) : void {
        map = _map;
        marker = L.circleMarker([0, 0], {
            radius: 8,
            color: "#ffffff",
            weight: 3,
            fillColor: "#fabb00",
            fillOpacity: 1
        });

        // Location needs a secure page and a browser that supports it
        if (!navigator.geolocation) return;

        // Centers at User Location
        navigator.geolocation.getCurrentPosition(position => { 
            // Don't center if accuracy is too low or the rider is outside the map's area
            if (position.coords.accuracy < 1000 && (!map.options.maxBounds || (map.options.maxBounds as L.LatLngBounds).contains([position.coords.latitude, position.coords.longitude])))
            {
                map.setView([position.coords.latitude, position.coords.longitude]);
                onCentered?.();
            }
        })

        // Follows the rider; the browser reports each move instead of the GPS being asked twice a second
        navigator.geolocation.watchPosition(position => {
            setLocation(position.coords.latitude, position.coords.longitude)
            if (position.coords.accuracy < 300) marker.addTo(map); // If accuracy is too low, don't display
            else marker.remove();
        }, () => marker.remove(), { maximumAge: 5000 })
    }
    /**
     * Location to set the marker to
     * @param latitude      latitude of new location
     * @param longitude     longitude of new location
     */
    export function setLocation(latitude: number, longitude: number) : void {
        marker.setLatLng([latitude, longitude]);
    }

    /* Private */

    let marker : L.CircleMarker;
    let map : L.Map;
}

export default Marker;
