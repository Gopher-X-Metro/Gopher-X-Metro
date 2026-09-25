import L from "leaflet";

// User Location Marker
namespace Marker { 

    /* Public */

    /**
     * Initalizes the marker on the map
     * @param _map map the user marker will display on
     */
    export function init(_map: L.Map) : void {
        map = _map;
        marker = L.circleMarker([0, 0], {
            radius: 8,
            color: "#ffffff",
            weight: 3,
            fillColor: "#fabb00",
            fillOpacity: 1
        });

        // Centers at User Location
        navigator.geolocation.getCurrentPosition(position => { 
            if (position.coords.accuracy < 1000) // If accuraccy is too low, don't center
                map.setView([position.coords.latitude, position.coords.longitude])
        })
    }
    /**
     * Updates the user's location
     */
    export function update() : void {
        if (marker)
            navigator.geolocation.getCurrentPosition(position => { 
                setLocation(position.coords.latitude, position.coords.longitude) 
                if (position.coords.accuracy < 300) marker.addTo(map); // If accuracy is too low, don't display
                else marker.remove();
            })
        else
            console.warn("The marker has not been created!")
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
