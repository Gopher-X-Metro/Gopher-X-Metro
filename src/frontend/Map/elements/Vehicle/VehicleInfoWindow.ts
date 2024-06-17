import InfoWindow from "../InfoWindow";

class VehicleInfoWindow extends InfoWindow {
    /**
     * Constructor for VehicleInfoWindow
     * @param routeId   ID of the route
     * @param location  Location of the infoWindow
     * @param map       Map the infowWindow is put on
     */
    constructor(routeId: string, map: google.maps.Map) {
        super(routeId, undefined, map);

        this.setContent("Route ID: " + this.routeId);

        this.getWindow().set("pixelOffset", new google.maps.Size(0, -15));
    }
}

export default VehicleInfoWindow;