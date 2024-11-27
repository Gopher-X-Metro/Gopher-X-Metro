import _DataAbstract from "src/data/internal/_DataAbstract";
import Realtime from "src/backend/Realtime";
import Data from "src/data/Data";

/**
 * Manages a direction of a route
 */
export default class _Direction extends _DataAbstract {
    /** Places that are in this direction */
    public readonly places: Map<string, Promise<Data.Place>>;

    /** Id of route that contains this direction */
    private readonly routeId: string;

    /**
     * Constructor for _Direction class
     * @param directionId id of direction
     * @param routeId id of route that contains this direction
     */
    constructor(directionId: number, routeId: string) {
        super(directionId);
        
        this.routeId = routeId;
        this.places = new Map<string, Promise<Data.Place>>();
    }

    /** Loads places for this direction */
    public async load() : Promise<void> {
        this.places.clear();

        // Load places
        await Realtime.getStops(this.routeId, this.id as number).then(stopData => {
            for (const place of stopData) {
                this.places.set(place.place_code, Data.Place.create(place.place_code, this.id as number, this.routeId, place.description));
            }
        });
    }
}