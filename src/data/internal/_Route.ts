import _DataAbstract from "./_DataAbstract";
import Realtime from "src/backend/Realtime";
import Data from "../Data";
import Resources from "src/backend/Resources";

/** Manages the route data */
export default class _Route extends _DataAbstract {
    /**
     * Constructor for the _Route class
     * @param routeId   id for the route
     */
    constructor(routeId: string) {
        super(routeId);

        this.visible = true;
        this.directions = new Map<number, Promise<Data.Direction>>();
        this.vehicles = new Map<string, Promise<Data.Vehicle>>();
        this.shapes = new Map<string, Promise<Data.Shape>>();
    }
    
    /** Loads the vehicles in this route */
    public async loadVehicles() : Promise<void> {
        // Load Vehicles
        await Realtime.getVehicles(this.id as string).then(response => {
            this.vehicles.clear();

            for (const vehicle of response)
                this.vehicles.set(String(vehicle.trip_id), Data.Vehicle.create(vehicle.trip_id, this.id as string, vehicle));
        })
    }

    /** Loads the directions in this route */
    public async loadDirections() : Promise<void> {
        this.directions.clear();

        // Load Directions
        await Realtime.getDirections(this.id as string).then(response => {
            for (const direction of response)
                this.directions.set( direction.direction_id, Data.Direction.create(direction.direction_id, this.id as string));
        })
    }

    public async loadShapes() : Promise<void> {
        this.shapes.clear();

        // Load Shapes
        await Resources.getShapeIds(this.id as string).then(response => {
            for (const shape of response) {
                console.log(shape);
            }
        })
    }

    /** Directions of this route */
    public readonly directions: Map<number, Promise<Data.Direction>>;
    /** Vehicles of this route */
    public readonly vehicles: Map<string, Promise<Data.Vehicle>>;
    /** Shapes of this route */
    public readonly shapes: Map<string, Promise<Data.Shape>>;

    private visible: boolean;
}