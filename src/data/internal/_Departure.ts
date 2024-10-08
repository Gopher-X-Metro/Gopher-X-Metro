import _DataAbstract from "./_DataAbstract";

/** Stores data about a departure */
export default class _Departure extends _DataAbstract {
    /**
     * Constructor for the _Departure class
     * @param departureId   id of the departure
     * @param placeId       id of the place that contains this deparutre
     * @param directionId   id of the direction that contains this departure
     * @param routeId       id of the route that contains this departure
     * @param data          data of the departure obtained from _Place
     */
    constructor(departureId: string, placeId: string, directionId: number, routeId: string, data: any) {
        super(departureId);
        this.placeId = placeId;
        this.directionId = directionId;
        this.routeId = routeId;

        this.data = data;
    }

    /** Extra data about this departure */
    public readonly data : any;
    /** Id of the place that contains this departure */
    public readonly placeId: string;
    /** Id of the direction that contains this departure */
    public readonly directionId: number;
    /** Id of the route that contains this departure */
    public readonly routeId: string;
}