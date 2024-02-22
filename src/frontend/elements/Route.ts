import Path from "./Path.ts";
import Stop from "./Stop.ts";
import Vehicle from "./Vehicle.ts";

class Route {

    /* Public */

    /**
     * Routes Constructor
     * @param routeId ID of the route
     */
    constructor(routeId: string) {
        this.routeId = routeId;
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
     * Get this route's ID
     */
    public getId() : string { return this.routeId; }
    /**
     * Adds a path to the route
     * @param routeId route ID of the path's route
     * @param shapeId shape ID of the path
     * @param tripID 
     * @param color color of the path
     * @param locations array of locations that describes the line 
     * @param map map the path will display on
     */
    public addPath(routeId: string, shapeId: string, tripID: string, color: string, locations: Array<google.maps.LatLng>, map: google.maps.Map) : void {
        this.paths.set(shapeId, new Path(routeId, shapeId, tripID, color, locations, map));
    }
    /**
     * Adds a stop to the route
     * @param routeId route ID of the stop's route
     * @param stopId ID of the stop
     * @param color color of the stop
     * @param location location of the stop
     * @param map map the stop will display on
     */
    public addStop(routeId: string, stopId: string, color: string, location: google.maps.LatLng, map: google.maps.Map) : void {
        this.stops.set(stopId, new Stop(routeId, stopId, color, location, map));
    }
    /**
     * Adds a vehicle to the route
     * @param routeId route ID of the vehicle
     * @param vehicleId ID of the vehicle
     * @param tripId trip ID of the vehicle
     * @param color color of the vehicle's marker
     * @param map map that the vehicle marker will display on
     */
    public addVehicle(routeId: string, vehicleId: string, tripId: string, color: string, map: google.maps.Map) : void {
        this.vehicles.set(vehicleId, new Vehicle(routeId, vehicleId, tripId, color, map));
    }

    /* Private */

    private routeId: string;
    private paths: Map<string, Path>;
    private stops: Map<string, Stop>;
    private vehicles: Map<string, Vehicle>;
}

export default Route;