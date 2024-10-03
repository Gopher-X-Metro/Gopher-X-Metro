import _DataAbstract from "./_DataAbstract";

export default class _Vehicle extends _DataAbstract {
    constructor(vehicleId: string, routeId: string, data: any) {
        super(vehicleId);
        this.routeId = routeId;

        this.data = data;

        this.directionId = data.direction_id;
        this.direction = data.direction;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.bearing = data.bearing;
        this.speed = data.speed;
        this.timestamp = data.timestamp;
    }

    public readonly data : any;

    public readonly bearing: number;
    public readonly direction: string;
    public readonly latitude: number;
    public readonly longitude: number;
    public readonly speed: number;
    public readonly timestamp: number;

    public readonly directionId: number;
    public readonly routeId: string;
}