class Path {
    // Path constructor
    constructor(routeId: string, shapeId: string, tripId: string, color: string, locations: Array<google.maps.LatLng>, map: google.maps.Map) {
        this.shapeId = shapeId;
        this.routeId = routeId;
        this.tripId = tripId;

        // The path of the bus on the map
        this.line = new window.google.maps.Polyline({
            path: locations,
            geodesic: true,
            strokeColor: "#" + color,
            strokeOpacity: 1.0,
            strokeWeight: Number(process.env.REACT_APP_LINE_NORMAL),
            map: map
        });
    }

    // Returns the Polyline object
    public getLine() : google.maps.Polyline { return this.line; }
    
    // Returns the route id this path is a part of.
    public getRouteId() : string { return this.routeId; }

    private shapeId: string;
    private routeId: string; 
    private tripId: string; 
    private line: google.maps.Polyline;
}

export default Path;
