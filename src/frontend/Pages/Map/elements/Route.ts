import L from "leaflet";
import Primative from "./abstracts/Primative.ts";

import Path from "./Path.ts";
import Stop from "./Stop.ts";
import Vehicle from "./Vehicle.ts";

class Route extends Primative {

    /* Public */

    /**
     * Routes Constructor
     * @param routeId ID of the route
     * @param map map to display the route
     */
    constructor(routeId: string, map: L.Map) {
        super(routeId, map);

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
    public addPath(shapeId: string, color: string, locations: Array<L.LatLng>) : void {
        this.paths.set(shapeId, new Path(shapeId, color, locations, this.map));
        this.paths.get(shapeId)?.setVisible(this.visible);
    }
    /**
     * Adds a stop to the route
     * @param stop the stop to add
     */
    public addStopObject(stopId: string, stop: Stop | undefined) : void {
        if (stop) {
            this.stops.set(stopId, stop);
            stop.addElement(this);
            stop.updateVisibility();
        }
    }
    /**
     * Adds a vehicle to the route
     * @param vehicle   the vehicle to add
     */
    public addVehicleObject(vehicleId: string, vehicle: Vehicle | undefined) : void {
        if (vehicle) {
            this.vehicles.set(vehicleId, vehicle);
            vehicle.setVisible(this.visible);
        }
    }
    /**
     * Sets the visibility of the route
     * @param visible  if the route should be visible
     */
    public setVisible(visible: boolean) {
        this.visible = visible;
        this.paths.forEach(path => path.setVisible(visible));
        this.vehicles.forEach(vehicle => vehicle.setVisible(visible && vehicle.isPositionUpdated()));
        this.stops.forEach(stop => stop.updateVisibility());
    }
    /**
     * 
     * @returns 
     */
    public isVisible() : boolean { return this.visible; }

    /* Private */

    private paths: Map<string, Path>;
    private stops: Map<string, Stop>;
    private vehicles: Map<string, Vehicle>;

    private visible: boolean;
}

export default Route;