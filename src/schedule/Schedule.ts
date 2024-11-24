import _RouteDetail from "./internal/_RouteDetail";
import _ExistsError from "./internal/_ExistsError";
import _FetchError from "./internal/_FetchError";
import _Route from "./internal/_Route";
import _ScheduleType from "./internal/_ScheduleType";
import _Timetable from "./internal/_Timetable";
import _Stop from "./internal/_Stop";

namespace Schedule {
    /** Routes Object Promises */
    const routes = new Map<string, Route>();

    const _initialize = (async () => {
        await fetch("https://svc.metrotransit.org/schedule/routes")
        .then(async response => {
            if (!response.ok) {
                throw new FetchError("Failed to fetch routes.");
            }

            (await response.json() as Array<Interface.Route>)
            .forEach(data => 
                routes.set(data.route_id, Route.create(data.route_id, data))
            )
        })
    })();

    export class FetchError extends _FetchError {};
    export class ExistsError extends _ExistsError {};

    export class Route extends _Route{
        public static create(routeId: string, data: Interface.Route) : Route {
            const route = new Route(routeId, data);

            return route;
        }

        /**
         * Gets route schedule from Schedule
         * @param routeId id of route
         * @returns Route Schedule Promise
         */
        static async get(routeId: string) : Promise<Route> {
            if (!routes.has(routeId)) {
                throw new ExistsError(`Route '${routeId}' does not have a schedule.`);
            }

            const route = await routes.get(routeId) as Route;

            if (route.detail === undefined) {
                route.detail = fetch(`https://svc.metrotransit.org/schedule/routedetails/${route.data.route_url_param}`)
                .then(async response => {
                    if (!response.ok) {
                        throw new Schedule.FetchError(`Failed to fetch route detail '${route.data.route_url_param}'`);
                    }
        
                    return new Schedule.RouteDetail(routeId, route.agencyId, route.data.route_url_param, await response.json());
                })
            }

            return routes.get(routeId) as Route;
        }
    }

    export class RouteDetail extends _RouteDetail{
        public static create(routeUrlParam: string, agencyId: number, routeId: string, data: Schedule.Interface.RouteDetail) {
            const detail = new RouteDetail(routeUrlParam, agencyId, routeId, data);
            
            return detail;
        }
    }

    export class ScheduleType extends _ScheduleType {
        public static create(scheduleTypeName: string, routeUrlParam: string, agencyId: number, routeId: string, data: Schedule.Interface.ScheduleType) {
            const type = new ScheduleType(scheduleTypeName, routeUrlParam, agencyId, routeId, data);
            
            return type;
        }
    }

    export class Timetable extends _Timetable {
        public static create(scheduleNumber: number, scheduleTypeName: string, routeUrlParam: string, agencyId: number, routeId: string, data: Schedule.Interface.TimetableDetail) {
            const table = new Timetable(scheduleNumber, scheduleTypeName, routeUrlParam, agencyId, routeId, data);
            
            return table;
        }
    }

    export class Stop extends _Stop {
        public static create(scheduleNumber: number, scheduleTypeName: string, routeUrlParam: string, agencyId: number, routeId: string, data: Schedule.Interface.Stop) {
            const stop = new Stop(scheduleNumber, scheduleTypeName, routeUrlParam, agencyId, routeId, data);
            
            return stop;
        }
    }

    export namespace Interface {
        export interface Route {
            route_id: string;
            route_short_name: string;
            agency_id: number;
            route_label: string;
            description: string;
            route_url_param: string;
            detail: Promise<RouteDetail>;
        }
        export interface RouteDetail {
            route_id: string;
            agency_id: number;
            agency_name: string;
            pick_change: string;
            route_short_name: string;
            route_long_name: string;
            route_desc: string;
            route_type: number;
            route_type_name: string;
            route_url: string;
            route_color: string;
            route_text_color: string;
            provider_contact: string;
            route_comment: string;
            schedules: Array<ScheduleType>;
        }
        export interface ScheduleType {
            schedule_type_name: string;
            view_order: number;
            booking: string;
            timetables: Array<TimetableDetail>;
        }
        export interface TimetableDetail {
            schedule_number: number;
            direction: string;
            direction_id: number;
        }

        export interface Timetable {
            description: string;
            timepoints: Array<Timepoint>;
            trips: Array<Trip>;
            footnotes: Array<Footnote>;
        }
        export interface Timepoint {
            timepoint_label: string;
            place_sequence: number;
            map_reference: number;
            downtown_zone: string;
        }
        export interface Trip {
            route_label: string;
            comment_tag: string;
            stop_times: Array<StopTime>;
        }
        export interface Footnote{
            comment_tag: string;
            comment_text: string;
        }
        export interface StopTime {
            departure_time: string;
            place_sequence: number;
            comment_tag: string;
        }
        export interface Stop {
            stop_id: string;
            stop_name: string;
            timepoint: boolean;
        }
    }
}

export default Schedule;