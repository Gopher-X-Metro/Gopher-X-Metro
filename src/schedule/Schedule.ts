import _Detail from "./internal/_Detail";
import _ExistsError from "./internal/_ExistsError";
import _FetchError from "./internal/_FetchError";
import _Route from "./internal/_Route";

namespace Schedule {
    /** Routes Object Promises */
    const routes = new Map<string, Promise<Route>>();

    const _initialize = (async () => {
        await fetch("https://svc.metrotransit.org/schedule/routes")
        .then(async response => {
            if (!response.ok) {
                throw new FetchError("Failed to fetch routes.");
            }

            (await response.json() as Array<Interface.Route>)
            .forEach(data => 
                routes.set(data.route_id, Route.create(data.route_id, data.agency_id, data))
            )
        })
    })();

    export class FetchError extends _FetchError {};
    export class ExistsError extends _ExistsError {};

    export class Route extends _Route{
        public static async create(routeId: string, agencyId: number, data: Interface.Route) : Promise<Route> {
            const route = new Route(routeId, agencyId, data);

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

            return routes.get(routeId) as Promise<Route>;
        }
    }

    export class Detail extends _Detail{
        public static async create(routeId: string, agencyId: number, routeUrlParam: string, data: Schedule.Interface.RouteDetail) {
            const detail = new Detail(routeId, agencyId, routeUrlParam, data);
            
            return detail;
        }
    }

    export class Timetable {

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
    }
}

export default Schedule;