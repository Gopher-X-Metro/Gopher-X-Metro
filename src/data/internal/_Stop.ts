import _DataAbstract from "./_DataAbstract";

/** Stores the data for a stop */
export default class _Stop extends _DataAbstract {
    /**
     * Constructor for the _Stop class
     * @param stopId        id of the stop   
     * @param placeId       id of the place that contains this stop
     * @param directionId   id of the direction that contains this stop
     * @param routeId       id of the route that contains this stop
     * @param data          data of the stop obtained from _Place
     */
    constructor(stopId: string, placeId: string, directionId: number, routeId: string, data: any) {
        super(stopId);
        this.directionId = directionId;
        this.routeId = routeId;
        this.placeId = placeId;

        this.description = data.description;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
    }
    /** Geographical latitude of the stop */
    public readonly latitude: number;
    /** Geographical longitude of the stop */
    public readonly longitude: number;
    /** Text description of the stop */
    public readonly description: string;

    /** Id of the direction that holds this stop */
    public readonly directionId: number;
    /** Id of the route that contains this stop */
    public readonly routeId: string;
    /** Id of the place that contains this stop */
    public readonly placeId: string;
}