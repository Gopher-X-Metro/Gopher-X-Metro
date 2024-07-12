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
        super(shapeId, map, new window.google.maps.Polyline({
            path: locations,
            geodesic: true,
            strokeColor: "#" + color,
            strokeOpacity: 1.0,
            strokeWeight: Number(process.env.REACT_APP_LINE_NORMAL),
            map: map,
            zIndex: -1
        }));
    }
}

export default Path;
