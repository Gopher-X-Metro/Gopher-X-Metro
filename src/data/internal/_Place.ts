import _DataAbstract from "./_DataAbstract";
import Realtime from "../../backend/Realtime";
import Data from "../Data";

/** Manages the place of a direction */
export default class _Place extends _DataAbstract {
    /**
     * Constrctor for the _Place class
     * @param placeId       id of the place
     * @param directionId   id of the direction that contains this place
     * @param routeId       id of the route that contains this place
     * @param description   text that describes the place
     */
    constructor(placeId: string, directionId: number, routeId: string, description: string) {
        super(placeId);
        this.directionId = directionId;
        this.routeId = routeId;
        this.description = description;
        
        this.stops = new Map<string, Data.Stop>();
        this.departures = new Map<string, Data.Departure>();
    }

    /** Loads the stops and departures */
    public async load() {
        this.departures.clear();
        this.stops.clear();
        
        // Loads both stops and departures
        await Realtime.getStopInfo(this.routeId, this.directionId, this.id as string).then(async info => {
            // Stops
            for (const stop of info.stops)
                this.stops.set(stop.stop_id, await Data.Stop.create(stop.stop_id, this.id as string, this.directionId, this.routeId, stop))

            // Departures
            for (const departure of info.departures)
                this.departures.set(departure.trip_id, await Data.Departure.create(departure.trip_id, this.id as string, this.directionId, this.routeId, departure))
        })
    }

    /** Loads departures separetly from stops */
    public async loadDepartures() {
        this.departures.clear();

        // Loads only departues
        await Realtime.getStopInfo(this.routeId, this.directionId, this.id as string).then(async info => {
            for (const departure of info.departures)
                this.departures.set(departure.trip_id, await Data.Departure.create(departure.trip_id, this.id as string, this.directionId, this.routeId, departure))
        })
    }

    /** Stops existing at this place */
    public readonly stops: Map<string, Data.Stop>;
    /** Departures that happen at this place */
    public readonly departures: Map<string, Data.Departure>;

    /** Text that describes this place */
    public readonly description: string;
    /** Id of the direction that contains this place */
    public readonly directionId: number;
    /** Id of the route that contains this place */
    public readonly routeId: string;
}