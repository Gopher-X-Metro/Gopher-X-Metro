import L from "leaflet";
import Element from "./abstracts/Element.ts";

export const LINE_NORMAL = Number(process.env.REACT_APP_LINE_NORMAL ?? 4);
export const LINE_BOLD = Number(process.env.REACT_APP_LINE_BOLD ?? 7);

class Path extends Element{

    /* Public */

    /**
     * Path Constructor
     * @param shapeId shape ID of the path
     * @param color color of the path
     * @param locations locations of points that draw the path
     * @param map map that the line is displayed on
     */
    constructor(shapeId: string, color: string, locations: Array<L.LatLng>, map: L.Map) {
        const polyline = L.polyline(locations, {
            color: "#" + color,
            opacity: 1.0,
            weight: LINE_NORMAL,
        });
        super(shapeId, map, polyline);
        polyline.on("mouseover", () => polyline.bringToFront());
    }
}

export default Path;
