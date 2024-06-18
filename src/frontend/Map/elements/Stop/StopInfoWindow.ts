import InfoWindowElement from "../InfoWindowElement";

class StopInfoWindow extends InfoWindowElement {
    /**
     * Constructor for StopInfoWindow
     * @param routeId   ID of the route
     * @param location  Location of the infoWindow
     * @param map       Map the infowWindow is put on
     */
    constructor(element: google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement, location: google.maps.LatLng, map: google.maps.Map) {
        super(element, location, map);
    }
}

export default StopInfoWindow;