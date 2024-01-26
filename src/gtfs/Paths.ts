import Routes from "./Routes.ts";

class Path {
    id: string;
    route: string; 
    tripID: string; 
    line: google.maps.Polyline;

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

        // If the user hovers over the line, change the width
        this.line.addListener("mouseover", () => Routes.getRoute(route)?.setBolded(true));

        // If the user stops hovering over the line, return back
        this.line.addListener("mouseout", () => Routes.getRoute(route)?.setBolded(false));
    }

    setBolded(bold: boolean) { this.line.set("strokeWeight", bold ? process.env.REACT_APP_LINE_BOLD : process.env.REACT_APP_LINE_NORMAL); }

    setVisible(visible: boolean) { this.line.setVisible(visible) }
}

class Paths {
    private paths: Map<string, Path>;

    constructor () {
        this.paths = new Map();
    }

    // Gets paths baised on its shape id
    getPath(id: string) {
        return this.paths.get(id)
    }

    // Adds a path to the path hashmap
    addPath(id: string, route: string, tripID: string, color: string, locations: Array<google.maps.LatLng>, map: google.maps.Map) {
        this.paths.set(id, new Path(id, route, tripID, color, locations, map))
    }

    forEach(callbackfn: (value: Path, key: string, map: Map<string, Path>) => void) { return this.paths.forEach(callbackfn) }
}

export default Paths