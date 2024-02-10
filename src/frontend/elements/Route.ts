import Path from "./Path.ts";
import Stop from "./Stop.ts";
import Vehicle from "./Vehicle.ts";

class Route {
    constructor(id: string) {
        this.id = id;
        this.paths = new Map<string, Path>();
        this.stops = new Map<string, Stop>();
        this.vehicles = new Map<string, Vehicle>();
    }

    public addPath(route: string, shapeId: string, tripID: string, color: string, locations: Array<google.maps.LatLng>, map: google.maps.Map) : void {
        this.paths.set(shapeId, new Path(route, shapeId, tripID, color, locations, map));
    }

    public addStop(route: string, stopId: string, color: string, location: google.maps.LatLng, map: google.maps.Map) : void {
        this.stops.set(stopId, new Stop(route, stopId, color, location, map));
    }

    public addVehicle(id: string, route: string, color: string, location: google.maps.LatLng, map: google.maps.Map) : void {
        this.vehicles.set(id, new Vehicle(id, route, color, location, map));
    }

    public getPaths() : Map<string, Path> | undefined { return this.paths; }

    public getStops() : Map<string, Stop> | undefined { return this.stops; }

    public getVehicles() : Map<string, Vehicle> | undefined { return this.vehicles; }

    public getId() : string { return this.id; }

    private id: string;
    private paths: Map<string, Path>;
    private stops: Map<string, Stop>;
    private vehicles: Map<string, Vehicle>;
}

export default Route;