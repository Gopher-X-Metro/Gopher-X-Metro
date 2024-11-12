export interface IShape {
    shapeID: string;
    agencyID: string;
    shapeName: string;
    routeID: string;
    description: string;
    points: string;
    source: string;
    updated: string;
    disabled: boolean;
    directions: string;
    dynamicTotalShapeTime: string;
    shape_dist_traveled: number;
    shape_pt_lat: string;
    shape_pt_lon: string;
}