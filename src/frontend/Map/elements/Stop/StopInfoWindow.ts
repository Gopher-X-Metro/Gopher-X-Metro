import InfoWindow from "../InfoWindow";

class StopInfoWindow extends InfoWindow {
    /**
     * Constructor for StopInfoWindow
     * @param routeId   ID of the route
     * @param location  Location of the infoWindow
     * @param map       Map the infowWindow is put on
     */
    constructor(routeId: string, location: google.maps.LatLng, map: google.maps.Map) {
        super(routeId, location, map);
    }
}

export default StopInfoWindow;