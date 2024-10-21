export interface IVehicle {
    trip_id: string;
    direction_id: string;
    direction: string;
    location_time: string;
    route_id: string;
    termianl: string;
    latitude: number;
    longitude: number;
    odometer: number;
    speed: number;
    timestamp: string;
    bearing?: number;
    routeID?: string;
}