import { ISchedule } from "src/backend/interface/ScheduleInterface";

export interface IRoute {
    route_id: string;
    agency_id: string;
    route_label: string;
    schedules: ISchedule[];
    route_url_param: string;
}