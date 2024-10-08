import _DataAbstract from "./_DataAbstract";

/** Stores the data for a stop */
export default class _Stop extends _DataAbstract {
    /**
     * Constructor for the _Stop class
     * @param stopId        
     * @param placeId 
     * @param directionId 
     * @param routeId 
     * @param data 
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
    
    public readonly latitude: number;
    public readonly longitude: number;
    public readonly description: number;

    public readonly directionId: number;
    public readonly routeId: string;
    public readonly placeId: string;
}