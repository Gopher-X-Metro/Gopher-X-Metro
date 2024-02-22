class Stop {

    /* Public */

    /**
     * Stop Constructor
     * @param routeId route ID the stop belongs to
     * @param stopId ID of the stop
     * @param color color of the stop
     * @param location location of the stop
     * @param map map the stop displays on
     */
    constructor(routeId: string, stopId: string, color: string, location: google.maps.LatLng, map: google.maps.Map) {
        this.stopId = stopId;
        this.routeId = routeId
        this.location = location;

        this.stopTimes = new Map<string, string | undefined>();

        this.marker = new window.google.maps.Circle({
            fillColor: color,
            fillOpacity: 0,
            strokeColor: color,
            center: this.location,
            radius: 10,
            clickable: true,
            map: map
        })
    }
    /**
     * Gets the marker object on the map
     */
    public getMarker() : google.maps.Circle { return this.marker; }
    /**
     * Gets the ID of the stop
     */
    public getStopId() : string { return this.stopId; }
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

    /* Private */

    private stopId: string;
    private routeId: string;

    private stopTimes: Map<string, string | undefined>;

    private location: google.maps.LatLng;
    private marker: google.maps.Circle;
}

export default Stop;