class Stop {
    // Stop class constructor
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

    // Returns the Circle object
    public getMarker() : google.maps.Circle { return this.marker; }
    
    // Adds a stop time to the hash
    public addStopTime(vehicleId: string, time: string | undefined) { this.stopTimes.set(vehicleId, time); }
    
    // Returns the Stop Times Hash
    public getStopTimes() : Map<string, string | undefined> { return this.stopTimes; }

    public getStopId() : string { return this.stopId; }

    // Returns the location of the stop
    public getLocation() : google.maps.LatLng { return this.location; }

    private stopId: string;
    private routeId: string;

    private stopTimes: Map<string, string | undefined>;

    private location: google.maps.LatLng;
    private marker: google.maps.Circle;
}

export default Stop;