export interface ISchedule {
    timetables: ITimeTable[];
    schedule_type_name: string;
}

export interface ITimeTable {
    schedule_number: number;
    direction: string;
    stop_list: any[];
    table: any[];
}