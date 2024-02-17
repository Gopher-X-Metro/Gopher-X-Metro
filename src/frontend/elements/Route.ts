import Path from "./Path.ts";
import Stop from "./Stop.ts";
import Vehicle from "./Vehicle.ts";

// Combines multiple parts of data into one
class Route {
    // Routes constructor
    constructor(routeId: string) {
        this.routeId = routeId;
        this.paths = new Map<string, Path>();
        this.stops = new Map<string, Stop>();
        this.vehicles = new Map<string, Vehicle>();
    }

    // Adds a Path object
    public addPath(routeId: string, shapeId: string, tripID: string, color: string, locations: Array<google.maps.LatLng>, map: google.maps.Map) : void {
        this.paths.set(shapeId, new Path(routeId, shapeId, tripID, color, locations, map));
    }

    // Adds a Stop object
    public addStop(routeId: string, stopId: string, color: string, location: google.maps.LatLng, map: google.maps.Map) : void {
        this.stops.set(stopId, new Stop(routeId, stopId, color, location, map));
    }

    // Adds a Vehicle object
    public addVehicle(routeId: string, vehicleId: string, tripId: string, color: string, map: google.maps.Map) : void {
        this.vehicles.set(vehicleId, new Vehicle(routeId, vehicleId, tripId, color, map));
    }

    // Returns Paths hash
    public getPaths() : Map<string, Path> { return this.paths; }

    // Returns Stops hash
    public getStops() : Map<string, Stop> { return this.stops; }

    // Returns Vehicles hash
    public getVehicles() : Map<string, Vehicle> { return this.vehicles; }

    // Returns the route id
    public getId() : string { return this.routeId; }

    private routeId: string;
    private paths: Map<string, Path>;
    private stops: Map<string, Stop>;
    private vehicles: Map<string, Vehicle>;
}

export default Route;