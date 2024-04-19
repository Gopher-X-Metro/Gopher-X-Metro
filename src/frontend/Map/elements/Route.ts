import Element from "./Element.ts";

import Path from "./Path.ts";
import Stop from "./Stop.ts";
import Vehicle from "./Vehicle.ts";


class Route extends Element {

    /* Public */

    /**
     * Routes Constructor
     * @param routeId ID of the route
     * @param map map to display the route
     */
    constructor(routeId: string, map: google.maps.Map) {
        super(routeId, "", map);

        this.paths = new Map<string, Path>();
        this.stops = new Map<string, Stop>();
        this.vehicles = new Map<string, Vehicle>();
    }
    /**
     * Gets the paths of this route
     */
    public getPaths() : Map<string, Path> { return this.paths; }
    /**
     * Gets the stops of this route
     */
    public getStops() : Map<string, Stop> { return this.stops; }
    /**
     * Gets the vehicles of this route
     */
    public getVehicles() : Map<string, Vehicle> { return this.vehicles; }
    /**
     * Adds a path to the route
     * @param shapeId shape ID of the path
     * @param color color of the path
     * @param locations array of locations that describes the line 
     */
    public addPath(shapeId: string, color: string, locations: Array<google.maps.LatLng>) : void {
        this.paths.set(shapeId, new Path(shapeId, color, locations, this.map));
    }
    /**
     * Adds a stop to the route
     * @param stopId ID of the stop
     * @param color color of the stop
     * @param location location of the stop
     */
    public addStop(stopId: string, color: string, location: google.maps.LatLng) : void {
        this.stops.set(stopId, new Stop(stopId, color, location, this.map));
    }
    /**
     * Adds a vehicle to the route
     * @param vehicleId ID of the vehicle
     * @param tripId trip ID of the vehicle
     * @param color color of the vehicle's marker
     */
    public addVehicle(routeId: string, vehicleId: string, color: string) : void {
        let busImageSrc = "";
        let arrowImageSrc = "";

        console.log(routeId);

        if (routeId === "120") {
            busImageSrc = "../../../img/120_bus.png";
            arrowImageSrc = "../../../img/120_arrow.png";
        } else if (routeId === "121") {
            busImageSrc = "../../../img/121_bus.png";
            arrowImageSrc = "../../../img/121_arrow.png";
        } else if (routeId === "122") {
            busImageSrc = "../../../img/122_bus.png";
            arrowImageSrc = "../../../img/122_arrow.png";
        } else if (routeId === "123") {
            busImageSrc = "../../../img/123_bus.png";
            arrowImageSrc = "../../../img/123_arrow.png";
        } else if (routeId === "124") {
            busImageSrc = "../../../img/124_bus.png";
            arrowImageSrc = "../../../img/124_arrow.png";
        } else if (routeId === "2") {
            busImageSrc = "../../../img/2_bus.png";
            arrowImageSrc = "../../../img/2_arrow.png";
        } else if (routeId === "3") {
            busImageSrc = "../../../img/3_bus.png";
            arrowImageSrc = "../../../img/3_arrow.png";
        } else if (routeId === "6") {
            busImageSrc = "../../img/6_bus.png";
            arrowImageSrc = "../../img/6_arrow.png";
        } else if (routeId === "902") {
            busImageSrc = "../../../img/902_greenline.png";
            arrowImageSrc = "../../../img/902_greenline_arrow.png";
        } else if (routeId === "901") {
            busImageSrc = "../../../img/901_blueline.png";
            arrowImageSrc = "../../../img/901_blueline_arrow.png";
        }

        this.vehicles.set(vehicleId, new Vehicle(vehicleId, color, this.map, busImageSrc, arrowImageSrc));
    }

    /* Private */

    private paths: Map<string, Path>;
    private stops: Map<string, Stop>;
    private vehicles: Map<string, Vehicle>;
}

export default Route;