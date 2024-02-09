class Path {
    constructor(id: string, route: string, tripID: string, color: string, locations: Array<google.maps.LatLng>, map: google.maps.Map) {
        this.id = id;
        this.route = route;
        this.tripID = tripID;

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

    public getLine() : google.maps.Polyline { return this.line; }
    
    public getRoute() : string { return this.route; }

    private id: string;
    private route: string; 
    private tripID: string; 
    private line: google.maps.Polyline;
}

export default Path;
