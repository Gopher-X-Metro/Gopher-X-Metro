export interface ITrip {
    routeID: string;
    service_id: string;
    trip_id: string;

    // TODO Standardize between all these shapeId, shapeID, shape_id, etc
    // This needs to be done for all objects like Route, Stop, etc.
    shapeID: string;
    shape_id: string;
}