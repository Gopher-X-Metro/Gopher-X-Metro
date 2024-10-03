import _Route from "./internal/_Route";
import _Direction from "./internal/_Direction";
import _Stop from "./internal/_Stop";
import _Place from "./internal/_Place";
import _Vehicle from "./internal/_Vehicle";
import _Departure from "./internal/_Departure";
import _ExistsError from "./internal/_ExistsError";

namespace Data {
    export class Route extends _Route {
        static load(routeId: string) : void {
            if (this.routes.has(routeId)) 
                throw new ExistsError(`Route '${routeId}' already loaded.`);

            this.routes.set(routeId, Route.create(routeId));
        }

        static get(routeId: string) : Promise<Route> {
            if (!this.routes.has(routeId))
                throw new ExistsError(`Route '${routeId}' has not been loaded.`);

            return this.routes.get(routeId) as Promise<Route>;
        }

        static getAll() : Promise<Array<Route>> { 
            return Promise.all(Array.from(this.routes.values())); 
        }

        private static routes = new Map<string, Promise<Route>>();
    };
    export class Direction extends _Direction {
        static async get(routeId: string, directionId: number) : Promise<Direction> {
            if (!(await Route.get(routeId)).directions.has(directionId))
                throw new ExistsError(`Direction '${directionId}' does not exist in route '${routeId}'`)

            return (await Route.get(routeId)).directions.get(directionId) as Promise<Direction>;
        }

        static async getAll() : Promise<Array<Direction>>
        static async getAll(routeId: string) : Promise<Array<Direction>>
        static async getAll(routeId?: string) : Promise<Array<Direction>> {
            if (routeId !== undefined)
                return Promise.all(Array.from((await Route.get(routeId)).directions.values()));
            else
                return Promise.all((await Route.getAll()).map(route => Array.from(route.directions.values())).flat());
        }
    };
    export class Place extends _Place {
        static async get(routeId: string, directionId: number, placeId: string) : Promise<Place> {
            if (!(await Direction.get(routeId, directionId)).places.has(placeId))
                throw new ExistsError(`Place '${placeId}' does not exist in direction '${directionId}' in route '${routeId}'`)
            
            return (await Direction.get(routeId, directionId)).places.get(placeId) as Promise<Place>;
        }

        static async getAll() : Promise<Array<Place>>
        static async getAll(routeId: string) : Promise<Array<Place>>
        static async getAll(routeId: string, directionId: number) : Promise<Array<Place>>
        static async getAll(routeId?: string, directionId?: number) : Promise<Array<Place>> {
            if (directionId !== undefined && routeId !== undefined)
                return Promise.all(Array.from((await Direction.get(routeId, directionId)).places.values()));
            else if (routeId !== undefined)
                return Promise.all((await Direction.getAll(routeId)).map(direction => Array.from(direction.places.values())).flat());
            else
                return Promise.all((await Direction.getAll()).map(direction => Array.from(direction.places.values())).flat());
        }
    };
    export class Vehicle extends _Vehicle {
        static async get(routeId: string, directionId: number, vehicleId: string) : Promise<Vehicle> {
            if (!(await Direction.get(routeId, directionId)).vehicles.has(vehicleId))
                throw new ExistsError(`Vehicle '${vehicleId}' does not exist in direction '${directionId}' in route '${routeId}'`)
            
            return (await Direction.get(routeId, directionId)).vehicles.get(vehicleId) as Promise<Vehicle>;
        }
        
        static async getAll() : Promise<Array<Vehicle>>
        static async getAll(routeId: string) : Promise<Array<Vehicle>>
        static async getAll(routeId: string, directionId: number) : Promise<Array<Vehicle>>
        static async getAll(routeId?: string, directionId?: number) : Promise<Array<Vehicle>> {
            if (directionId !== undefined && routeId !== undefined)
                return Promise.all(Array.from((await Direction.get(routeId, directionId)).vehicles.values()));
            else if (routeId !== undefined)
                return Promise.all((await Direction.getAll(routeId)).map(direction => Array.from(direction.vehicles.values())).flat());
            else
                return Promise.all((await Direction.getAll()).map(direction => Array.from(direction.vehicles.values())).flat());
        }
    };
    export class Departure extends _Departure {
        static async get(routeId: string, directionId: number, placeId: string, departureId: string) : Promise<Departure> {
            if (!(await Place.get(routeId, directionId, placeId)).departures.has(departureId))
                throw new ExistsError(`Departure '${departureId}' does not exist in place ${placeId}'' in direction '${directionId}' in route '${routeId}'`)

            return (await Place.get(routeId, directionId, placeId)).departures.get(departureId) as Departure;
        }

        static async getAll() : Promise<Array<Departure>>
        static async getAll(routeId: string) : Promise<Array<Departure>>
        static async getAll(routeId: string, directionId: number) : Promise<Array<Departure>>
        static async getAll(routeId: string, directionId: number, placeId: string) : Promise<Array<Departure>>
        static async getAll(routeId?: string, directionId?: number, placeId?: string) : Promise<Array<Departure>> {
            if (placeId !== undefined && directionId !== undefined && routeId !== undefined)
                return Promise.all(Array.from((await Place.get(routeId, directionId, placeId)).departures.values()));
            else if (directionId !== undefined && routeId !== undefined)
                return Promise.all((await Place.getAll(routeId, directionId)).map(place => Array.from(place.departures.values())).flat());
            else if (routeId !== undefined)
                return Promise.all((await Place.getAll(routeId)).map(place => Array.from(place.departures.values())).flat());
            else
                return Promise.all((await Place.getAll()).map(place => Array.from(place.departures.values())).flat());

        }
    };
    export class Stop extends _Stop {
        static async get(routeId: string, directionId: number, placeId: string, stopId: string) : Promise<Stop> {
            if (!(await Place.get(routeId, directionId, placeId)).stops.has(stopId))
                throw new ExistsError(`Stop '${stopId}' does not exist in place '${placeId}' in direction '${directionId}' in route '${routeId}'`)
            
            return (await Place.get(routeId, directionId, placeId)).stops.get(stopId) as Stop;
        }

        static async getAll() : Promise<Array<Stop>>
        static async getAll(routeId: string) : Promise<Array<Stop>>
        static async getAll(routeId: string, directionId: number) : Promise<Array<Stop>>
        static async getAll(routeId: string, directionId: number, placeId: string) : Promise<Array<Stop>>
        static async getAll(routeId?: string, directionId?: number, placeId?: string) : Promise<Array<Stop>> {
            if (placeId !== undefined && directionId !== undefined && routeId !== undefined)
                return Promise.all(Array.from((await Place.get(routeId, directionId, placeId)).stops.values()));
            else if (directionId !== undefined && routeId !== undefined)
                return Promise.all((await Place.getAll(routeId, directionId)).map(place => Array.from(place.stops.values())).flat());
            else if (routeId !== undefined)
                return Promise.all((await Place.getAll(routeId)).map(place => Array.from(place.stops.values())).flat());
            else
                return Promise.all((await Place.getAll()).map(place => Array.from(place.stops.values())).flat());

        }
    };

    export class ExistsError extends _ExistsError {};
}

export default Data;