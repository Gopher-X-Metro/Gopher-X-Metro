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

        this.visible = false;
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
        this.paths.get(shapeId)?.getLine().setVisible(this.visible);
    }
    /**
     * Adds a stop to the route
     * @param stopId ID of the stop
     * @param color color of the stop
     * @param location location of the stop
     */
    public addStop(stopId: string, routeID: string, color: string, location: google.maps.LatLng) : void {
        this.stops.set(stopId, new Stop(routeID, stopId, color, location, this.map));
        this.stops.get(stopId)?.getMarker().setVisible(this.visible);
    }
    /**
     * Adds a vehicle to the route
     * @param vehicleId ID of the vehicle
     * @param tripId trip ID of the vehicle
     * @param color color of the vehicle's marker
     */
    public addVehicle(vehicleId: string, color: string, images: string[2]) : void {
        this.vehicles.set(vehicleId, new Vehicle(vehicleId, color, this.map, images));
        this.vehicles.get(vehicleId)?.setVisible(this.visible);
    }
    /**
     * Sets the visibility of the route
     * @param visible  if the route should be visible
     */
    public setVisible(visible: boolean) {
        this.visible = visible;
        this.stops.forEach(stop => stop.getMarker().setVisible(visible));
        this.paths.forEach(path => path.getLine().setVisible(visible));
        this.vehicles.forEach(vehicle => vehicle.setVisible(visible));
    }

    /* Private */

    private paths: Map<string, Path>;
    private stops: Map<string, Stop>;
    private vehicles: Map<string, Vehicle>;

    private visible: boolean;
}

export default Route;