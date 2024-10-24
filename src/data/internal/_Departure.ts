import _DataAbstract from "src/data/internal/_DataAbstract";

/**
 * Stores data about a departure
 */
export default class _Departure extends _DataAbstract {
    /** Extra data about this departure */
    public readonly data : any;
    /** Id of place that contains this departure */
    public readonly placeId: string;
    /** Id of direction that contains this departure */
    public readonly directionId: number;
    /** Id of route that contains this departure */
    public readonly routeId: string;

    /**
     * Constructor for the _Departure class
     * @param departureId id of departure
     * @param placeId id of place that contains this deparutre
     * @param directionId id of direction that contains this departure
     * @param routeId id of route that contains this departure
     * @param data data of departure obtained from _Place
     */
    constructor(departureId: string, placeId: string, directionId: number, routeId: string, data: any) {
        super(departureId);
        
        this.placeId = placeId;
        this.directionId = directionId;
        this.routeId = routeId;
        this.data = data;
    }
}