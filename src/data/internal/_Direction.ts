import _DataAbstract from "./_DataAbstract";
import Realtime from "src/backend/Realtime";
import Data from "../Data";

/** Manages a direction of a route */
export default class _Direction extends _DataAbstract {
    /**
     * Constructor for the _Direction class
     * @param directionId   id of the direction
     * @param routeId       id of the route that contains this direction
     */
    constructor(directionId: number, routeId: string) {
        super(directionId);
        this.routeId = routeId;

        this.places = new Map<string, Promise<Data.Place>>();
    }

    /** Loads the places for this direction */
    public async load() {
        this.places.clear();

        // Load places
        await Realtime.getStops(this.routeId, this.id as number).then(response => {
            for (const place of response)
                this.places.set(place.place_code, Data.Place.create(place.place_code, this.id as number, this.routeId, place.description));
        })
    }

    /** Places that are in this direction */
    public readonly places: Map<string, Promise<Data.Place>>;

    /** Id of the route that contains this direction */
    private readonly routeId: string;
}