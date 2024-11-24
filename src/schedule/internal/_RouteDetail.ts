import Schedule from "../Schedule";

export default class _RouteDetail {
    public readonly routeId: string;
    public readonly agencyId: number;
    public readonly routeUrlParam: string;

    public readonly schedules: Array<Schedule.ScheduleType>;

    protected readonly data: Schedule.Interface.RouteDetail
    
    constructor (routeUrlParam: string, agencyId: number, routeId: string, data: Schedule.Interface.RouteDetail) {
        this.routeId = routeId;
        this.agencyId = agencyId;
        this.routeUrlParam = routeUrlParam
        
        this.schedules = new Array<Schedule.ScheduleType>();

        for (const schedule of data.schedules) {
            this.schedules.push(Schedule.ScheduleType.create(schedule.schedule_type_name, routeUrlParam, agencyId, routeId, schedule));
        }
        
        this.data = data;
    }
}