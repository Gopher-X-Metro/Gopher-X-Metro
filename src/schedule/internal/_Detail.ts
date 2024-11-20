import Schedule from "../Schedule";

export default class _Detail {
    public readonly routeId: string;
    public readonly agencyId: number;
    public readonly routeUrlParam: string;

    public readonly data: Schedule.Interface.RouteDetail
    
    constructor (routeId: string, agencyId: number, routeUrlParam: string, data: Schedule.Interface.RouteDetail) {
        this.routeId = routeId;
        this.agencyId = agencyId;
        this.routeUrlParam = routeUrlParam

        this.data = data;
    }
}