import { IDeparture } from "src/backend/interface/DepartureInterface";

export interface IStop {
    stop_id: string;
    latitude: number;
    longitude: number;
    route_label: string;
    place_code: string;
    status: number;
    description: string;
    stops: IStop[];
    departures: IDeparture[];
}

export interface IStopTimes {
    tripId: string;
}