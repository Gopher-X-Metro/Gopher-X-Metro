import InfoWindowElement from "../InfoWindowElement";

class VehicleInfoWindow extends InfoWindowElement {
    /**
     * Constructor for VehicleInfoWindow
     * @param routeId   ID of the route
     * @param map       Map the infowWindow is put on
     */
    constructor(element: google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement, map: google.maps.Map) {
        super(element, undefined, map);

        this.getWindow().set("pixelOffset", new google.maps.Size(0, -15));
    }
}

export default VehicleInfoWindow;