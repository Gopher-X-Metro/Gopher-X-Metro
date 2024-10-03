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

    private readonly bearing: number;
    private readonly direction: string;
    private readonly latitude: number;
    private readonly longitude: number;
    private readonly speed: number;
    private readonly timestamp: number;

    private readonly directionId: number;
    private readonly routeId: string;
}