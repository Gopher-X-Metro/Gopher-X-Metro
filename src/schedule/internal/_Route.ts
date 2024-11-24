import Schedule from "../Schedule";

export default class _Route {
    public readonly routeId: string;
    public readonly agencyId: number;
    protected readonly data: Schedule.Interface.Route

    protected detail: Promise<Schedule.RouteDetail> | undefined;
    
    constructor (routeId: string, data : Schedule.Interface.Route) {
        this.data = data;
        
        this.routeId = routeId;
        this.agencyId = data.agency_id;

        this.detail = undefined
    }
}