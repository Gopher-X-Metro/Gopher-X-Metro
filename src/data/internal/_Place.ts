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

    public async load() {
        this.departures.clear();
        this.stops.clear();
        
        await Realtime.getStopInfo(this.routeId, this.directionId, this.id as string).then(async info => {
            for (const stop of info.stops)
                this.stops.set(stop.stop_id, await Data.Stop.create(stop.stop_id, this.id as string, this.directionId, this.routeId, stop))

            for (const departure of info.departures)
                this.departures.set(departure.trip_id, await Data.Departure.create(departure.trip_id, this.id as string, this.directionId, this.routeId, departure))
        })
    }

    public async loadDepartures() {
        this.departures.clear();

        await Realtime.getStopInfo(this.routeId, this.directionId, this.id as string).then(async info => {
            for (const departure of info.departures)
                this.departures.set(departure.trip_id, await Data.Departure.create(departure.trip_id, this.id as string, this.directionId, this.routeId, departure))
        })
    }

    public readonly stops: Map<string, Data.Stop>;
    public readonly departures: Map<string, Data.Departure>;

    public readonly description: string;
    public readonly directionId: number;
    public readonly routeId: string;
}