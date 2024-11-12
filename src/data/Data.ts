import _Route from "./internal/_Route";
import _Direction from "./internal/_Direction";
import _Stop from "./internal/_Stop";
import _Place from "./internal/_Place";
import _Vehicle from "./internal/_Vehicle";
import _Departure from "./internal/_Departure";
import _ExistsError from "./internal/_ExistsError";

/** Data Access Object (DAO) */
namespace Data {
    /** Route Data and Route Access */
    export class Route extends _Route {
        /**
         * Create a new Route
         * @param routeId   id of the route
         */
        static async create(routeId: string) : Promise<Data.Route> {
            const route = new Data.Route(routeId);
            await route.loadVehicles();
            await route.loadDirections();
            return route;
        }

        /**
         * Loads a new route into Data
         * @param routeId id of the route
         */
        static load(routeId: string) : void {
            if (routes.has(routeId)) 
                throw new ExistsError(`Route '${routeId}' already loaded.`);

            routes.set(routeId, Route.create(routeId));
        }

        /**
         * Gets the route object from Data
         * @param routeId   id of the route
         * @returns         Route Promise
         */
        static get(routeId: string) : Promise<Route> {
            if (!routes.has(routeId))
                throw new ExistsError(`Route '${routeId}' has not been loaded.`);

            return routes.get(routeId) as Promise<Route>;
        }

        /** Gets all of the routes within Data */
        static all() : Promise<Array<Route>> { 
            return Promise.all(Array.from(routes.values())); 
        }
    };
    /** Direction Data and Direction Access */
    export class Direction extends _Direction {
        /**
         * Creates a new Direction object
         * @param directionId   id of the direction
         * @param routeId       id of the route that contains the direction
         */
        static async create(directionId: number, routeId: string) : Promise<Data.Direction> {
            const direction = new Data.Direction(directionId, routeId);
            await direction.load();
            return direction;
        }

        /** Reload all directions */
        static async reload() : Promise<void>
        /** Reload all directions within a route */
        static async reload(routeId: string) : Promise<void>
        /** Reload all directions without a route and direction */
        static async reload(routeId: string, directionId: number) : Promise<void>
        static async reload(routeId?: string, directionId?: number) : Promise<void> {
            if (routeId !== undefined && directionId !== undefined)
                // Reload a direction
                await (await Direction.get(routeId, directionId)).load();
            else if (routeId !== undefined)
                // Reload directions within a route
                for (const direction of await Direction.all(routeId))
                    await Direction.reload(routeId, direction.id as number);
            else 
                // Reload all directions
                for (const route of await Route.all())
                    await Direction.reload(route.id as string);
        }

        /**
         * Gets the direction object from Data
         * @param routeId       id route the direction is in
         * @param directionId   id of the direction
         * @returns             Direction Promise
         */
        static async get(routeId: string, directionId: number) : Promise<Direction> {
            if (!(await Route.get(routeId)).directions.has(directionId))
                throw new ExistsError(`Direction '${directionId}' does not exist in route '${routeId}'`)

            return (await Route.get(routeId)).directions.get(directionId) as Promise<Direction>;
        }

        /** Gets all of the Directions within Data */
        static async all() : Promise<Array<Direction>>
        /** Gets all of the Directions within a Route */
        static async all(routeId: string) : Promise<Array<Direction>>
        static async all(routeId?: string) : Promise<Array<Direction>> {
            if (routeId !== undefined)
                // Gets all directions within a route
                return Promise.all(Array.from((await Route.get(routeId)).directions.values()));
            else
                // Gets all directions
                return Promise.all((await Route.all()).map(route => Array.from(route.directions.values())).flat());
        }
    };
    /** Vehicle Data and Vehicle Access */
    export class Vehicle extends _Vehicle {
        /**
         * Creates a new Vehicle object
         * @param vehicleId     id of the vehicle
         * @param routeId       id of the route that contains the vehicle 
         * @param data          data of the vehicle
         */
        static async create(vehicleId: string, routeId: string, data: any) : Promise<Data.Vehicle> {
            const vehicle = new Data.Vehicle(vehicleId, routeId, data);
            return vehicle;   
        }

        /**
         * Gets the Vehicle from the Data object
         * @param routeId       id of the route that contains the vehicle
         * @param vehicleId     id of the vehicle
         * @returns             Vehicle Promise
         */
        static async get(routeId: string, vehicleId: string) : Promise<Vehicle> {
            if (!(await Route.get(routeId)).vehicles.has(vehicleId))
                throw new ExistsError(`Vehicle '${vehicleId}' does not exist in route '${routeId}'`)
            
            return (await Route.get(routeId)).vehicles.get(vehicleId) as Promise<Vehicle>;
        }
        
        /** Gets all the vehicles within Data */
        static async all() : Promise<Array<Vehicle>>
        /** Gets all the vehicles within the route */
        static async all(routeId: string) : Promise<Array<Vehicle>>
        static async all(routeId?: string) : Promise<Array<Vehicle>> {
            if (routeId !== undefined)
                // Gets all vehicles in a route
                return Promise.all((await Route.get(routeId)).vehicles.values());
            else
                // Gets all vehicles
                return Promise.all((await Route.all()).map(route => Array.from(route.vehicles.values())).flat());
        }

        /** Reloads all the vehicles in Data */
        static async reload() : Promise<void>;
        /** Reloads all the vehicles within a route*/
        static async reload(routeId: string) : Promise<void>
        static async reload(routeId?: string) : Promise<void> {
            if (routeId !== undefined)
                // Reloads all vehicles in a route
                await (await Route.get(routeId)).loadVehicles();
            else 
                // Reloads all vehicles
                for (const route of await Route.all())
                    await route.loadVehicles();
        }
    };
    /** Place Data and Place Access */
    export class Place extends _Place {
        /**
         * Creates a new Place object
         * @param placeId       id of the place
         * @param directionId   id of the direction that contains the place
         * @param routeId       id of the route that contains the place
         * @param description   text that describes the place
         */
        static async create(placeId: string, directionId: number, routeId: string, description: string) : Promise<Data.Place> {
            const place = new Data.Place(placeId, directionId, routeId, description);
            await place.load();
            return place;
        }

        /** Reloads all Places */
        static async reload() : Promise<void>
        /** Relaods all Places within a route */
        static async reload(routeId: string) : Promise<void>
        /** Relaods all Places within a route and direction */
        static async reload(routeId: string, directionId: number) : Promise<void>
        /** Reloads a specific Place within a route and direction*/
        static async reload(routeId: string, directionId: number, placeId: string) : Promise<void>
        static async reload(routeId?: string, directionId?: number, placeId?: string) : Promise<void> {
            if (routeId !== undefined && directionId !== undefined && placeId !== undefined)
                // Reload a specific Place
                await (await Place.get(routeId, directionId, placeId)).load()
            else if (routeId !== undefined && directionId !== undefined)
                // Reload all places in a direction
                for (const place of await Place.all(routeId, directionId))
                    await Place.reload(routeId, directionId, place.id as string);
            else if (routeId !== undefined)
                // Reload all places in a route
                for (const direction of await Direction.all(routeId))
                    await Place.reload(routeId, direction.id as number);
            else 
                // Reload all places
                for (const route of await Route.all())
                    await Place.reload(route.id as string);
        }
        
        /**
         * Gets a place from Data
         * @param routeId       id of the route that contains the place
         * @param directionId   id of the direction that contains the place
         * @param placeId       id of the place
         * @returns             Place Object Proimse
         */
        static async get(routeId: string, directionId: number, placeId: string) : Promise<Place> {
            if (!(await Direction.get(routeId, directionId)).places.has(placeId))
                throw new ExistsError(`Place '${placeId}' does not exist in direction '${directionId}' in route '${routeId}'`)
            
            return (await Direction.get(routeId, directionId)).places.get(placeId) as Promise<Place>;
        }

        /** Gets all places in Data */
        static async all() : Promise<Array<Place>>
        /** Gets all places in a route */
        static async all(routeId: string) : Promise<Array<Place>>
        /** Gets all places in a route and direction */
        static async all(routeId: string, directionId: number) : Promise<Array<Place>>
        static async all(routeId?: string, directionId?: number) : Promise<Array<Place>> {
            if (directionId !== undefined && routeId !== undefined)
                // Gets all places in a direction
                return Promise.all(Array.from((await Direction.get(routeId, directionId)).places.values()));
            else if (routeId !== undefined)
                // Gets all places in a route
                return Promise.all((await Direction.all(routeId)).map(direction => Array.from(direction.places.values())).flat());
            else
                // Gets all places
                return Promise.all((await Direction.all()).map(direction => Array.from(direction.places.values())).flat());
        }
    };
    /** Departure Data and Departure Access */
    export class Departure extends _Departure {
        /**
         * Creates a new Departure Object
         * @param departureId   id of the deparutre 
         * @param placeId       id of the place that contains the departure
         * @param directionId   id of the direction that contains the deparutre
         * @param routeId       id of the route that contains the departure
         * @param data          data of the departure
         */
        static async create(departureId: string, placeId: string, directionId: number, routeId: string, data: any) : Promise<Data.Departure> {
            const departure = new Data.Departure(departureId, placeId, directionId, routeId, data);
            return departure;
        }

        /** Reloads all the departures in Data */
        static async reload() : Promise<void>
        /** Reloads all the departures within a route */
        static async reload(routeId: string) : Promise<void>
        /** Reloads all the deparutres within a route and direction */
        static async reload(routeId: string, directionId: number) : Promise<void>
        /** Reloads all the departures within a route, direction, and place */
        static async reload(routeId: string, directionId: number, placeId: string) : Promise<void>
        static async reload(routeId?: string, directionId?: number, placeId?: string) : Promise<void> {
            if (routeId !== undefined && directionId !== undefined && placeId !== undefined)
                // Reload departures in a place
                await (await Place.get(routeId, directionId, placeId)).loadDepartures();
            else if (routeId !== undefined && directionId !== undefined)
                // Reloads all departures in a direction
                for (const place of await Place.all(routeId, directionId))
                    await place.loadDepartures();
            else if (routeId !== undefined)
                // Reloads all departures in a route
                for (const place of await Place.all(routeId))
                    await place.loadDepartures();
            else
                // Reloads all departures
                for (const place of await Place.all())
                    await place.loadDepartures();
        }

        /**
         * Gets a specified departure in Data
         * @param routeId       id of the route that contains the departure
         * @param directionId   id of the direction that contains the departure
         * @param placeId       id of the place that contains the departure
         * @param departureId   id of the departure
         * @returns             Deparutre Object Promise
         */
        static async get(routeId: string, directionId: number, placeId: string, departureId: string) : Promise<Departure> {
            if (!(await Place.get(routeId, directionId, placeId)).departures.has(departureId))
                throw new ExistsError(`Departure '${departureId}' does not exist in place ${placeId}'' in direction '${directionId}' in route '${routeId}'`)

            return (await Place.get(routeId, directionId, placeId)).departures.get(departureId) as Departure;
        }

        /** Gets all departures within Data */
        static async all() : Promise<Array<Departure>>
        /** Gets all departures within a route */
        static async all(routeId: string) : Promise<Array<Departure>>
        /** Gets all deoartures within a route and direction */
        static async all(routeId: string, directionId: number) : Promise<Array<Departure>>
        /** Gets all departures within a route, direction, and place */
        static async all(routeId: string, directionId: number, placeId: string) : Promise<Array<Departure>>
        static async all(routeId?: string, directionId?: number, placeId?: string) : Promise<Array<Departure>> {
            if (placeId !== undefined && directionId !== undefined && routeId !== undefined)
                // Gets all departues within a place
                return Promise.all(Array.from((await Place.get(routeId, directionId, placeId)).departures.values()));
            else if (directionId !== undefined && routeId !== undefined)
                // Gets all deparutes within a direction
                return Promise.all((await Place.all(routeId, directionId)).map(place => Array.from(place.departures.values())).flat());
            else if (routeId !== undefined)
                // Gets all departures within a route
                return Promise.all((await Place.all(routeId)).map(place => Array.from(place.departures.values())).flat());
            else
                // Gets all departures
                return Promise.all((await Place.all()).map(place => Array.from(place.departures.values())).flat());
        }
    };
    /** Stop Data and Stop Access */
    export class Stop extends _Stop {
        /**
         * Creates a new Stop object
         * @param stopId        id of the stop
         * @param placeId       id of the place that contains the stop
         * @param directionId   id of the direction that contains the stop
         * @param routeId       id of the route that contains the stop
         * @param data          data of the stop
         */
        static async create(stopId: string, placeId: string, directionId: number, routeId: string, data: any) : Promise<Data.Stop> {
            const stop = new Data.Stop(stopId, placeId, directionId, routeId, data);
    
            return stop;
        }

        /**
         * Gets a specifc stop from Data
         * @param routeId       id of the route that contains the stop
         * @param directionId   id of the direction that contains the stop
         * @param placeId       id of the place that contains the stop
         * @param stopId        id of the stop
         * @returns             Stop Object Promise
         */
        static async get(routeId: string, directionId: number, placeId: string, stopId: string) : Promise<Stop> {
            if (!(await Place.get(routeId, directionId, placeId)).stops.has(stopId))
                throw new ExistsError(`Stop '${stopId}' does not exist in place '${placeId}' in direction '${directionId}' in route '${routeId}'`)
            
            return (await Place.get(routeId, directionId, placeId)).stops.get(stopId) as Stop;
        }

        /** Gets all stop within Data */
        static async all() : Promise<Array<Stop>>
        /** Gets all stops within a route */
        static async all(routeId: string) : Promise<Array<Stop>>
        /** Gets all stops within a route and direction */
        static async all(routeId: string, directionId: number) : Promise<Array<Stop>>
        /** Gets all stops within a route, direction, and place */
        static async all(routeId: string, directionId: number, placeId: string) : Promise<Array<Stop>>
        static async all(routeId?: string, directionId?: number, placeId?: string) : Promise<Array<Stop>> {
            if (placeId !== undefined && directionId !== undefined && routeId !== undefined)
                // Gets all stops within a place
                return Promise.all(Array.from((await Place.get(routeId, directionId, placeId)).stops.values()));
            else if (directionId !== undefined && routeId !== undefined)
                // Gets all stops within a direction
                return Promise.all((await Place.all(routeId, directionId)).map(place => Array.from(place.stops.values())).flat());
            else if (routeId !== undefined)
                // Gets all stops within a route
                return Promise.all((await Place.all(routeId)).map(place => Array.from(place.stops.values())).flat());
            else
                // Gets all stops
                return Promise.all((await Place.all()).map(place => Array.from(place.stops.values())).flat());
        }
    };

    /** Exists Error */
    export class ExistsError extends _ExistsError {};

    
    /** Routes Object Promises*/
    const routes = new Map<string, Promise<Route>>();
}

export default Data;