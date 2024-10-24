export interface IRoutes {
    routeID: string;
    agencyID: string;
    shortName: string;
    longName: string;
    routeType: string;
    sequence: number;
    description: string;
    color: string;
    textColor: string;
    onDemand: boolean;
    calcETA: boolean;
    hidden: boolean;
    updated: boolean;
    disabled: boolean;
    scheduleURL: string;
    scheduleURLType: string;
    shapeID: string;
    schedAdh: boolean;
    aliases: string;
    source: string;
    LastETACalc: string;
    routeCode: string;
    special_service: boolean;
}