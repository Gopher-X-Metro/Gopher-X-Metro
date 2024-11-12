export interface IExternalVehicle {
    tripID: string;
    directionID: string;
    direction: string;
    positionUpdated: number;
    timestamp: number,
    termianl: string;
    lat: number;
    lng: number;
    odometer: number;
    speed: number;
    linkBearing: number;
    routeID: number;
}