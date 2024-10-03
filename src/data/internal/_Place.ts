import _DataAbstract from "./_DataAbstract";
import Realtime from "../../backend/Realtime";
import Data from "../Data";

export default class _Place extends _DataAbstract {
    constructor(placeCode: string, directionId: number, routeId: string, description: string) {
        super(placeCode);
        this.directionId = directionId;
        this.routeId = routeId;
        this.description = description;
        
        this.stops = new Map<string, Data.Stop>();
        this.departures = new Map<string, Data.Departure>();
    }

    public readonly stops: Map<string, Data.Stop>;
    public readonly departures: Map<string, Data.Departure>;

    public async reload() {
        this.departures.clear();

        await Realtime.getStopInfo(this.routeId, this.directionId, this.getId() as string).then(async info => {
            for (const stop of info.stops)
                this.stops.set(stop.stop_id, await Data.Stop.create(stop.stop_id, this.getId() as string, this.directionId, this.routeId, stop))

            for (const departure of info.departures)
                this.departures.set(departure.trip_id, await Data.Departure.create(departure.trip_id, this.getId() as string, this.directionId, this.routeId, departure))
        })
    }

    static async create(placeCode: string, directionId: number, routeId: string, description: string) : Promise<Data.Place> {
        const place = new Data.Place(placeCode, directionId, routeId, description);
        await place.reload();
        return place;
    }

    public readonly description: string;
    public readonly directionId: number;
    public readonly routeId: string;
}