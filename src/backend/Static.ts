namespace Data {
    /* Public */

    /**
     * Loads the calendar
     */
    export async function load() : Promise<void> {        
        const data = await getJSON("/calendar.json");
        data?.calendar.forEach((element: { service_id: string; }) => calendar.set(element.service_id, element));
        data?.dates.forEach((element: { service_id: string; date: string; exception_type: string }) => 
            exceptions.set(element.service_id + "|" + element.date, element.exception_type));
    }

    /* API */

    /**
     * Gets if the service is running today
     * @param serviceId the id of the service
     * @returns if its running
     */
    export function isServiceRunning(serviceId: string) : boolean {
        const today = date();
        const exception = exceptions.get(serviceId + "|" + today);
        if (exception) return exception === "1"; // 1 = added, 2 = removed

        const service = getCalendar(serviceId);
        return service ? service.start_date <= today && today <= service.end_date && service[days[(new Date()).getDay()]] === "1" : false;
    }
    /**
     * Gets the calendar of metro
     */
    export function getCalendar(serviceId: string) : any { 
        return calendar.get(serviceId); 
    }
    /**
     * Gets the trips (service and shape ids) of a route
     * @param routeId ID of the route
     */
    export async function getTrips(routeId: string) : Promise<any> {
        return (await getRoute(routeId))?.trips ?? [];
    }
    /**
     * Gets the route data of a route
     * @param routeId ID of the route
     */
    export async function getRoutes(routeId: string) : Promise<any> {
        const route = await getRoute(routeId);
        return route ? [route.route] : [];
    }
    /**
     * Gets the points of a shape as [lat, lon] pairs in order
     * @param shapeId ID of the shape
     */
    export async function getShapes(shapeId: string) : Promise<Array<[number, number]>> {
        if (!shapes.has(shapeId))
            shapes.set(shapeId, await getJSON("/shapes/" + shapeId + ".json") ?? []);
        
        return shapes.get(shapeId); 
    }

    /**
     * Gets the current date in format yyyymmdd
     */
    export function date() {
        var date = new Date(),
            month = '' + (date.getMonth() + 1),
            day = '' + date.getDate(),
            year = date.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return year+month+day
    }

    /* Private */
    const calendar : Map<string, any> = new Map<string, any>();
    const exceptions : Map<string, string> = new Map<string, string>();
    const routes : Map<string, Promise<any>> = new Map<string, Promise<any>>();
    const shapes : Map<string, any> = new Map<string, any>();

    /**
     * Gets a route's file, sharing one request between callers
     * @param routeId ID of the route
     */
    function getRoute(routeId: string) : Promise<any> {
        if (!routes.has(routeId))
            routes.set(routeId, getJSON("/routes/" + routeId + ".json"));
        return routes.get(routeId) as Promise<any>;
    }

    /**
     * Fetches a generated GTFS file, or undefined if it doesn't exist
     * @param file path of the file within the gtfs folder
     */
    async function getJSON(file: string) : Promise<any> {
        const response = await fetch(DATA_URL + file);
        return response.ok ? response.json() : undefined;
    }
    
    /* Days of the week */
    const days = [
        "sunday", 
        "monday", 
        "tuesday", 
        "wednesday", 
        "thursday", 
        "friday", 
        "saturday"
    ];

    // Generated from Metro Transit's GTFS feed by scripts/build-gtfs.mjs
    const DATA_URL = process.env.PUBLIC_URL + "/gtfs"
}

export default Data
