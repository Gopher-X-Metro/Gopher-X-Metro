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
    constructor(routeId: string, stopId: string, color: string, location: google.maps.LatLng, map: google.maps.Map) {
        super(stopId, color, map);
        this.routeId = routeId;
        this.location = location;
        this.stopTimes = new Map<string, string | undefined>();

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

        this.infoWindow = new StopInfoWindow(routeId, location, map);

        this.marker.addListener("click", () => {
            if (this.infoWindow.isOpen())
                this.infoWindow.close();
            else
                this.infoWindow.open();
        })
    }   
    /**
     * Gets the info window object on the map
     */
    public getInfoWindow() : StopInfoWindow { return this.infoWindow; }
    /**
     * Gets the marker object on the map
     */
    public getMarker() : google.maps.Circle { return this.marker; }
    /**
     * Gets the stop times hash
     */
    public getStopTimes() : Map<string, string | undefined> { return this.stopTimes; }
    /**
     * Adds a stop time to the stop times hash
     * @param vehicleId id of the vehicle
     * @param time time of the stop
     */
    public addStopTime(vehicleId: string, time: string | undefined) { this.stopTimes.set(vehicleId, time); }
    /**
     * Sets the description of the info window
     * @param description   the html text for the info window
     */
    public setDescription(description: string) : void { this.infoWindow.setContent(description); }

    /* Private */

    private stopTimes: Map<string, string | undefined>;
    private infoWindow: StopInfoWindow;
    private location: google.maps.LatLng;
    private marker: google.maps.Circle;
    private routeId: string;
}

export default Stop;