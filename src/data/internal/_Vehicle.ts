import _DataAbstract from "src/data/internal/_DataAbstract";

/**
 * Stores data for a vehicle
 */
export default class _Vehicle extends _DataAbstract {
    /** Aditional data about the vehicle */
    public readonly data : any;
    /** Direction the vehicle is heading in degrees */
    public readonly bearing: number;
    /** Text of the direction the vehicle is heading */
    public readonly direction: string;
    /** Geographical latitude of the vehicle */
    public readonly latitude: number;
    /** Geographical longitude of the vehicle */
    public readonly longitude: number;
    /** Time when the bus location was last updated */
    public readonly timestamp: number;
    /** Id of the direction that contains this vehicle */
    public readonly directionId: number;
    /** Id of the route that contains this vehicle */
    public readonly routeId: string;

    /**
     * Constructor for _Vehicle class
     * @param vehicleId id of vehicle
     * @param routeId id of route that contains this vehicle
     * @param data data of vehicle obtained from _Route
     */
    constructor(vehicleId: string, routeId: string, data: any) {
        super(vehicleId);
        
        this.routeId = routeId;
        this.data = data;
        this.directionId = data.direction_id;
        this.direction = data.direction;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.bearing = data.bearing;
        this.timestamp = data.timestamp;
    }
}