import _Route from "./internal/_Route";
import _Direction from "./internal/_Direction";
import _Stop from "./internal/_Stop";
import _Place from "./internal/_Place";
import _Vehicle from "./internal/_Vehicle";
import _Departure from "./internal/_Departure";
import _ExistsError from "./internal/_ExistsError";

namespace Data {
    export class Route extends _Route {
        static async create(routeId: string) : Promise<Data.Route> {
            const route = new Data.Route(routeId);
    
            await route.loadVehicles();
    
            await route.loadDirections();
            
            return route;
        }

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

        static all() : Promise<Array<Route>> { 
            return Promise.all(Array.from(this.routes.values())); 
        }

        private static routes = new Map<string, Promise<Route>>();
    };
    export class Direction extends _Direction {
        static async create(directionId: number, routeId: string) : Promise<Data.Direction> {
            const direction = new Data.Direction(directionId, routeId);
            await direction.load();
            return direction;
        }

        static async reload() : Promise<void>
        static async reload(routeId: string) : Promise<void>
        static async reload(routeId: string, directionId: number) : Promise<void>
        static async reload(routeId?: string, directionId?: number) : Promise<void> {
            if (routeId !== undefined && directionId !== undefined)
                await (await Direction.get(routeId, directionId)).load();
            else if (routeId !== undefined)
                for (const direction of await Direction.all(routeId))
                    await Direction.reload(routeId, direction.id as number);
            else 
                for (const route of await Route.all())
                    await Direction.reload(route.id as string);
        }

        static async get(routeId: string, directionId: number) : Promise<Direction> {
            if (!(await Route.get(routeId)).directions.has(directionId))
                throw new ExistsError(`Direction '${directionId}' does not exist in route '${routeId}'`)

            return (await Route.get(routeId)).directions.get(directionId) as Promise<Direction>;
        }

        static async all() : Promise<Array<Direction>>
        static async all(routeId: string) : Promise<Array<Direction>>
        static async all(routeId?: string) : Promise<Array<Direction>> {
            if (routeId !== undefined)
                return Promise.all(Array.from((await Route.get(routeId)).directions.values()));
            else
                return Promise.all((await Route.all()).map(route => Array.from(route.directions.values())).flat());
        }
    };
    export class Vehicle extends _Vehicle {
        static async create(vehicleId: string, routeId: string, data: any) : Promise<Data.Vehicle> {
            const vehicle = new Data.Vehicle(vehicleId, routeId, data);
            return vehicle;   
        }

        static async get(routeId: string, vehicleId: string) : Promise<Vehicle> {
            if (!(await Route.get(routeId)).vehicles.has(vehicleId))
                throw new ExistsError(`Vehicle '${vehicleId}' does not exist in route '${routeId}'`)
            
            return (await Route.get(routeId)).vehicles.get(vehicleId) as Promise<Vehicle>;
        }
        
        static async all() : Promise<Array<Vehicle>>
        static async all(routeId: string) : Promise<Array<Vehicle>>
        static async all(routeId?: string) : Promise<Array<Vehicle>> {
            if (routeId !== undefined)
                return Promise.all((await Route.get(routeId)).vehicles.values());
            else
                return Promise.all((await Route.all()).map(route => Array.from(route.vehicles.values())).flat());
        }

        static async reload() : Promise<void>;
        static async reload(routeId: string) : Promise<void>
        static async reload(routeId?: string) : Promise<void> {
            if (routeId !== undefined)
                await (await Route.get(routeId)).loadVehicles();
            else 
                for (const route of await Route.all())
                    await route.loadVehicles();
        }
    };
    export class Place extends _Place {
        static async create(placeId: string, directionId: number, routeId: string, description: string) : Promise<Data.Place> {
            const place = new Data.Place(placeId, directionId, routeId, description);
            await place.load();
            return place;
        }

        static async reload() : Promise<void>
        static async reload(routeId: string) : Promise<void>
        static async reload(routeId: string, directionId: number) : Promise<void>
        static async reload(routeId: string, directionId: number, placeId: string) : Promise<void>
        static async reload(routeId?: string, directionId?: number, placeId?: string) : Promise<void> {
            if (routeId !== undefined && directionId !== undefined && placeId !== undefined)
                await (await Place.get(routeId, directionId, placeId)).load()
            else if (routeId !== undefined && directionId !== undefined)
                for (const place of await Place.all(routeId, directionId))
                    await Place.reload(routeId, directionId, place.id as string);
            else if (routeId !== undefined)
                for (const direction of await Direction.all(routeId))
                    await Place.reload(routeId, direction.id as number);
            else 
                for (const route of await Route.all())
                    await Place.reload(route.id as string);
        }

        static async get(routeId: string, directionId: number, placeId: string) : Promise<Place> {
            if (!(await Direction.get(routeId, directionId)).places.has(placeId))
                throw new ExistsError(`Place '${placeId}' does not exist in direction '${directionId}' in route '${routeId}'`)
            
            return (await Direction.get(routeId, directionId)).places.get(placeId) as Promise<Place>;
        }

        static async all() : Promise<Array<Place>>
        static async all(routeId: string) : Promise<Array<Place>>
        static async all(routeId: string, directionId: number) : Promise<Array<Place>>
        static async all(routeId?: string, directionId?: number) : Promise<Array<Place>> {
            if (directionId !== undefined && routeId !== undefined)
                return Promise.all(Array.from((await Direction.get(routeId, directionId)).places.values()));
            else if (routeId !== undefined)
                return Promise.all((await Direction.all(routeId)).map(direction => Array.from(direction.places.values())).flat());
            else
                return Promise.all((await Direction.all()).map(direction => Array.from(direction.places.values())).flat());
        }
    };
    export class Departure extends _Departure {
        static async create(departureId: string, placeId: string, directionId: number, routeId: string, data: any) : Promise<Data.Departure> {
            const departure = new Data.Departure(departureId, placeId, directionId, routeId, data);
            return departure;
        }

        static async reload() : Promise<void>
        static async reload(routeId: string) : Promise<void>
        static async reload(routeId: string, directionId: number) : Promise<void>
        static async reload(routeId: string, directionId: number, placeId: string) : Promise<void>
        static async reload(routeId?: string, directionId?: number, placeId?: string) : Promise<void> {
            if (routeId !== undefined && directionId !== undefined && placeId !== undefined)
                await (await Place.get(routeId, directionId, placeId)).loadDepartures();
            else if (routeId !== undefined && directionId !== undefined)
                for (const place of await Place.all(routeId, directionId))
                    await place.loadDepartures();
            else if (routeId !== undefined)
                for (const place of await Place.all(routeId))
                    await place.loadDepartures();
            else
                for (const place of await Place.all())
                    await place.loadDepartures();
        }

        static async get(routeId: string, directionId: number, placeId: string, departureId: string) : Promise<Departure> {
            if (!(await Place.get(routeId, directionId, placeId)).departures.has(departureId))
                throw new ExistsError(`Departure '${departureId}' does not exist in place ${placeId}'' in direction '${directionId}' in route '${routeId}'`)

            return (await Place.get(routeId, directionId, placeId)).departures.get(departureId) as Departure;
        }

        static async all() : Promise<Array<Departure>>
        static async all(routeId: string) : Promise<Array<Departure>>
        static async all(routeId: string, directionId: number) : Promise<Array<Departure>>
        static async all(routeId: string, directionId: number, placeId: string) : Promise<Array<Departure>>
        static async all(routeId?: string, directionId?: number, placeId?: string) : Promise<Array<Departure>> {
            if (placeId !== undefined && directionId !== undefined && routeId !== undefined)
                return Promise.all(Array.from((await Place.get(routeId, directionId, placeId)).departures.values()));
            else if (directionId !== undefined && routeId !== undefined)
                return Promise.all((await Place.all(routeId, directionId)).map(place => Array.from(place.departures.values())).flat());
            else if (routeId !== undefined)
                return Promise.all((await Place.all(routeId)).map(place => Array.from(place.departures.values())).flat());
            else
                return Promise.all((await Place.all()).map(place => Array.from(place.departures.values())).flat());
        }
    };
    export class Stop extends _Stop {
        static async create(stopId: string, placeId: string, directionId: number, routeId: string, data: any) : Promise<Data.Stop> {
            const stop = new Data.Stop(stopId, placeId, directionId, routeId, data);
    
            return stop;
        }

        static async get(routeId: string, directionId: number, placeId: string, stopId: string) : Promise<Stop> {
            if (!(await Place.get(routeId, directionId, placeId)).stops.has(stopId))
                throw new ExistsError(`Stop '${stopId}' does not exist in place '${placeId}' in direction '${directionId}' in route '${routeId}'`)
            
            return (await Place.get(routeId, directionId, placeId)).stops.get(stopId) as Stop;
        }

        static async all() : Promise<Array<Stop>>
        static async all(routeId: string) : Promise<Array<Stop>>
        static async all(routeId: string, directionId: number) : Promise<Array<Stop>>
        static async all(routeId: string, directionId: number, placeId: string) : Promise<Array<Stop>>
        static async all(routeId?: string, directionId?: number, placeId?: string) : Promise<Array<Stop>> {
            if (placeId !== undefined && directionId !== undefined && routeId !== undefined)
                return Promise.all(Array.from((await Place.get(routeId, directionId, placeId)).stops.values()));
            else if (directionId !== undefined && routeId !== undefined)
                return Promise.all((await Place.all(routeId, directionId)).map(place => Array.from(place.stops.values())).flat());
            else if (routeId !== undefined)
                return Promise.all((await Place.all(routeId)).map(place => Array.from(place.stops.values())).flat());
            else
                return Promise.all((await Place.all()).map(place => Array.from(place.stops.values())).flat());
        }
    };

    export class ExistsError extends _ExistsError {};
}

export default Data;