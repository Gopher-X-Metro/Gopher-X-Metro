export interface IStop {
    stop_id: string;
    latitude: number;
    longitude: number;
    route_label: string;
    place_code: string;
    status: number;
    description: string;
    stops: any[];
    departures: any[];
}

export interface IStopTimes {
    
}