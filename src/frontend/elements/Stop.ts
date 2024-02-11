class Stop {
    constructor(routeId: string, stopId: string, color: string, location: google.maps.LatLng, map: google.maps.Map) {
        this.stopId = stopId;
        this.routeId = routeId
        this.location = location;

        this.stopTimes = new Map<string, [string | undefined, string | undefined]>();

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

    public getMarker() : google.maps.Circle { return this.marker; }
    
    public getStopTimes() : Map<string, [string | undefined, string | undefined]> { return this.stopTimes; }
    public addStopTime(tripId: string, arrivalTime: string | undefined, departureTime: string | undefined) : void { this.stopTimes.set(tripId, [arrivalTime, departureTime]); }

    public getLocation() : google.maps.LatLng { return this.location; }

    private stopId: string;
    private routeId: string;

    private stopTimes: Map<string, [string | undefined, string | undefined]>;

    private location: google.maps.LatLng;
    private marker: google.maps.Circle;
}

export default Stop;