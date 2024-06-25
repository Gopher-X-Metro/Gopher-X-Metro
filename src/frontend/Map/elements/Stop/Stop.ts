import Element from "../Element.ts";
import StopInfoWindow from "./StopInfoWindow.ts";


class Stop extends Element {
    /* Public */

    /**
     * Stop Constructor
     * @param stopId ID of the stop
     * @param color color of the stop
     * @param location location of the stop
     * @param map map the stop displays on
     */
    constructor(stopId: string, color: string, location: google.maps.LatLng, map: google.maps.Map) {
        super(stopId, color, map);
        this.location = location;

        this.marker = new window.google.maps.Circle({
            fillColor: this.getColor(),
            fillOpacity: 100,
            strokeWeight: 10,
            strokeColor: this.getColor(),
            center: this.location,
            radius: 5,
            clickable: true,
            map: map
        });

        this.infoWindow = new StopInfoWindow(this.marker, location, map);
    }
    /**
     * Gets the marker object on the map
     */
    public getMarker() : google.maps.Circle { return this.marker; }
    /**
     * Updates the info window information
     */
    public updateInfoWindow() : void {
    }
    /**
     * Updates the info window information
     */
    public closeInfoWindow() : void { this.infoWindow.close(); }
    /**
     * Sets the description of the info window
     * @param description   the html text for the info window
     * @deprecated
     */
    public setDescription(description: string) : void { this.infoWindow.setContent(description); }

    /* Private */
    private infoWindow: StopInfoWindow;
    private location: google.maps.LatLng;
    private marker: google.maps.Circle;
}

export default Stop;