import Realtime from "../../backend/Realtime";
import _DataAbstract from "./_DataAbstract";
import Data from "../Data";

export default class _Direction extends _DataAbstract {
    constructor(directionId: number, routeId: string) {
        super(directionId);
        this.routeId = routeId;

        this.places = new Map<string, Promise<Data.Place>>();
        this.vehicles = new Map<string, Promise<Data.Vehicle>>();
    }

    public async reload() {
        this.places.clear();
        await Realtime.getStops(this.routeId, this.getId() as number).then(response => {
            for (const place of response)
                this.places.set(place.place_code, Data.Place.create(place.place_code, this.getId() as number, this.routeId, place.description))
        })

        this.vehicles.clear();
        await Realtime.getVehicles(this.routeId).then(response => {
            for (const vehicle of response)
                this.vehicles.set(String(vehicle.trip_id), Data.Vehicle.create(vehicle.trip_id, this.getId() as number, this.routeId, vehicle))
        })
    }

    static async create(directionId: number, routeId: string) : Promise<Data.Direction> {
        const direction = new Data.Direction(directionId, routeId);
        await direction.reload();
        return direction;
    }

    
    public readonly places: Map<string, Promise<Data.Place>>;
    public readonly vehicles: Map<string, Promise<Data.Vehicle>>;

    private readonly routeId: string;
}