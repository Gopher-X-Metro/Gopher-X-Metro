import Element from "./Element.ts";

class Path extends Element{

    /* Public */

    /**
     * Path Constructor
     * @param routeId route ID the path belongs to
     * @param shapeId shape ID of the path
     * @param color color of the path
     * @param locations locations of points that draw the path
     * @param map map that the line is displayed on
     */
    constructor(shapeId: string, color: string, locations: Array<google.maps.LatLng>, map: google.maps.Map) {
        super(shapeId, color, map);

        // The path of the bus on the map
        this.line = new window.google.maps.Polyline({
            path: locations,
            geodesic: true,
            strokeColor: this.getColor(),
            strokeOpacity: 1.0,
            strokeWeight: Number(process.env.REACT_APP_LINE_NORMAL),
            map: map
        });
    }
    /**
     * Gets the polyline object on the map
     */
    public getLine() : google.maps.Polyline { return this.line; }

    /* Private */

    private line: google.maps.Polyline;
}

export default Path;
