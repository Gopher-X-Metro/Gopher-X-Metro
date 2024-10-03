import _DataAbstract from "./_DataAbstract";

export default class _Departure extends _DataAbstract {
    constructor(departureId: string, placeId: string, directionId: number, routeId: string, data: any) {
        super(departureId);
        this.placeId = placeId;
        this.directionId = directionId;
        this.routeId = routeId;

        this.data = data;
    }

    public readonly data : any;
    public readonly placeId: string;
    public readonly directionId: number;
    public readonly routeId: string;
}