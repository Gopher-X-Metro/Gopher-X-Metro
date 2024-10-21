export interface IExternalVehicle {
    tripID: string;
    directionID: string;
    direction: string;
    location_time: string;
    termianl: string;
    lat: number;
    lng: number;
    odometer: number;
    speed: number;
    timestamp: string;
    bearing?: number;
    routeID?: string;
}