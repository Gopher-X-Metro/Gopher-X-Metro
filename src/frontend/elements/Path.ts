class Path {

    /* Public */

    /**
     * Path Constructor
     * @param routeId route ID the path belongs to
     * @param shapeId shape ID of the path
     * @param tripId 
     * @param color color of the path
     * @param locations locations of points that draw the path
     * @param map map that the line is displayed on
     */
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
    /**
     * Gets the polyline object on the map
     */
    public getLine() : google.maps.Polyline { return this.line; }
    /**
     * Gets this path's route ID
     */
    public getRouteId() : string { return this.routeId; }
    /**
     * Gets the path's shape ID
     */
    public getShapeID() : string { return this.shapeId; }

    /* Private */

    private shapeId: string;
    private routeId: string; 
    private tripId: string; 
    private line: google.maps.Polyline;
}

export default Path;
