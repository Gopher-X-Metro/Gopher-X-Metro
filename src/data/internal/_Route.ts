import _DataAbstract from "src/data/internal/_DataAbstract";
import Realtime from "src/backend/Realtime";
import Data from "src/data/Data";

/**
 * Manages the route data
 */
export default class _Route extends _DataAbstract {
    /** Directions of this route */
    public readonly directions: Map<number, Promise<Data.Direction>>;
    /** Vehicles of this route */
    public readonly vehicles: Map<string, Promise<Data.Vehicle>>;
    /** Vehicles visible or not */
    private visible: boolean;

    /**
     * Constructor for _Route class
     * @param routeId id for route
     */
    constructor(routeId: string) {
        super(routeId);

        this.visible = true;
        this.directions = new Map<number, Promise<Data.Direction>>();
        this.vehicles = new Map<string, Promise<Data.Vehicle>>();
    }
    
    /** Loads vehicles in this route */
    public async loadVehicles() : Promise<void> {
        this.vehicles.clear();

        // Load Vehicles
        await Realtime.getVehicles(this.id as string).then(vehicleData => {
            if (vehicleData) {
                for (const vehicle of vehicleData) {
                    this.vehicles.set(String(vehicle.trip_id), Data.Vehicle.create(vehicle.trip_id, this.id as string, vehicle));
                }
            }
        });
    }

    /** Loads directions in this route */
    public async loadDirections() : Promise<void> {
        this.directions.clear();

        // Load Directions
        await Realtime.getDirections(this.id as string).then(directionData => {
            for (const direction of directionData) {
                this.directions.set(direction.direction_id, Data.Direction.create(direction.direction_id, this.id as string));
            }
        });
    }
}