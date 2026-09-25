import { getCachedJSON } from "src/backend/Fetch.ts";

const HOUR = 60 * 60 * 1000;
namespace Schedule {
    /* Public */

    /**
     * Gets all the routes that are avalible
     * @returns a list of all the routes
     */
    export async function getRoutes() : Promise<Array<any>> {
        return await getCachedJSON("https://svc.metrotransit.org/schedule/routes", HOUR);
    }
    /**
     * Gets the specified route data of all routes
     * @param routeId the route ID
     * @returns the route data
     */
    export async function getRoute(routeId: string) : Promise<any> {
        for (const route of (await getRoutes()) ?? [])
            if (route.route_id === routeId) 
                return route;
    }
    /**
     * Gets more specified details about the route
     * @param routeId the route ID
     * @returns the specified data about the route
     */
    export async function getRouteDetails(routeId: string) : Promise<any> {
        const route = await getRoute(routeId);
        if (!route) return { schedules: [] };
        return (await getCachedJSON("https://svc.metrotransit.org/schedule/routedetails/"+route.route_url_param, HOUR)) ?? { schedules: [] }
    }
    /**
     * Gets the stop list for the route and schedule
     * @param routeId       route ID
     * @param scheduleId    schedule ID
     * @returns             stop list for the route schedule
     */
    export async function getStopList(routeId: string, scheduleId: number) : Promise<Array<any>> {
        return await getCachedJSON("https://svc.metrotransit.org/schedule/stoplist/"+routeId+"/"+scheduleId, HOUR)
    }

    /* Private */

    /**
     * Gets the week of the date in terms of Sunday, Saturday, and Weekday
     */
    export function getWeekDate() : string | undefined {
        const date = new Date();
        switch (date.getDay()) {
            case 0:
                return "Sunday"
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                return "Weekday"
            case 6:
                return "Saturday"
        }
    }
}

export default Schedule;