export interface IVehicle {
    trip_id: string;
    direction_id: string;
    direction: string;
    location_time: number;
    route_id: string;
    termianl: string;
    latitude: number;
    longitude: number;
    odometer: number;
    speed: number;
    timestamp: number;
    bearing?: number;
    routeID?: string;
}