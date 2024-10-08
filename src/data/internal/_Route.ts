import _DataAbstract from "./_DataAbstract";
import Realtime from "src/backend/Realtime";
import Data from "../Data";

export default class _Route extends _DataAbstract {
    constructor(routeId: string) {
        super(routeId);

        this.visible = true;
        this.directions = new Map<number, Promise<Data.Direction>>();
        this.vehicles = new Map<string, Promise<Data.Vehicle>>();
    }
    
    public async loadVehicles() : Promise<void> {
        this.vehicles.clear();

        await Realtime.getVehicles(this.id as string).then(response => {
            for (const vehicle of response)
                this.vehicles.set(String(vehicle.trip_id), Data.Vehicle.create(vehicle.trip_id, this.id as string, vehicle))
        })
    }

    public async loadDirections() : Promise<void> {
        await Realtime.getDirections(this.id as string).then(response => {
            for (const direction of response)
                this.directions.set( direction.direction_id, Data.Direction.create(direction.direction_id, this.id as string));
        })
    }

    public readonly directions: Map<number, Promise<Data.Direction>>;
    public readonly vehicles: Map<string, Promise<Data.Vehicle>>;

    private visible: boolean;
}