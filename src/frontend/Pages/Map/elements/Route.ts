import Primative from "src/frontend/Pages/Map/elements/abstracts/Primative";
import Path from "src/frontend/Pages/Map/elements/Path";
import Stop from "src/frontend/Pages/Map/elements/Stop";
import Vehicle from "src/frontend/Pages/Map/elements/Vehicle";

class Route extends Primative {
    private paths: Map<string, Path>;
    private stops: Map<string, Stop>;
    private vehicles: Map<string, Vehicle>;
    private visible: boolean;

    /**
     * Routes Constructor
     * @param routeId ID of route
     * @param map map to display the route
     */
    constructor(routeId: string, map: google.maps.Map) {
        super(routeId, map);

        this.paths = new Map<string, Path>();
        this.stops = new Map<string, Stop>();
        this.vehicles = new Map<string, Vehicle>();
        this.visible = false;
    }

    /**
     * Gets paths of this route
     * @returns map of paths to route
     */
    public getPaths() : Map<string, Path> {
        return this.paths; 
    }

    /**
     * Gets stops of this route
     * @returns map of stops of route
     */
    public getStops() : Map<string, Stop> { 
        return this.stops; 
    }

    /**
     * Gets the vehicles of this route
     * @returns map of vehicles of route
     */
    public getVehicles() : Map<string, Vehicle> { 
        return this.vehicles;
    }

    /**
     * Adds a path to route
     * @param shapeId shape ID of path
     * @param color color of path
     * @param locations array of locations that describes the line 
     */
    public addPath(shapeId: string, color: string, locations: Array<google.maps.LatLng>) : void {
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
     * @param vehicle vehicle to add
     */
    public addVehicleObject(vehicleId: string, vehicle: Vehicle | undefined) : void {
        if (vehicle) {
            this.vehicles.set(vehicleId, vehicle);
            vehicle.setVisible(this.visible);
        }
    }

    /**
     * Sets visibility of route
     * @param visible if route should be visible
     */
    public setVisible(visible: boolean) : void {
        this.visible = visible;
        this.paths.forEach(path => path.setVisible(visible));
        this.vehicles.forEach(vehicle => vehicle.setVisible(visible && vehicle.isPositionUpdated()));
        this.stops.forEach(stop => stop.updateVisibility());
    }

    /**
     * Checks if visible or not
     * @returns boolean if visible
     */
    public isVisible() : boolean { 
        return this.visible; 
    }

    /* Depreciated / Unused */

    /**
     * Adds a stop to route
     * @param stopId ID of stop
     * @param color color of stop
     * @param location location of stop
     * @deprecated We no longer use addStop to create stops
     */
    private addStop(stopId: string, color: string, name: string, direction: string, location: google.maps.LatLng) : void {
        this.stops.set(stopId, new Stop(stopId, color, name, direction, location, this.map));
        this.stops.get(stopId)?.setVisible(this.visible);
    }
    /**
     * Adds a vehicle to the route
     * @param vehicleId ID of vehicle
     * @param tripId trip ID of vehicle
     * @param color color of vehicle's marker
     * @deprecated We no longer use addVehicle to create vehicles
     */
    private addVehicle(vehicleId: string, color: string, images: string[2]) : void {
        this.vehicles.set(vehicleId, new Vehicle(vehicleId, images, this.map));
        this.vehicles.get(vehicleId)?.setVisible(this.visible);
    }
}

export default Route;