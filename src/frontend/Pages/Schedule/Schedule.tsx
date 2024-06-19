import React, { useState, useEffect } from "react";

import Schedule from "../../../backend/Schedule";

const route = "3";

function SchedulePage() {
    const [scheduleRouteDetail, setScheduleRouteDetail] = useState<any>();
    const [scheduleTimeTable, setScheduleTimeTable] = useState<any>([]);

    useEffect(() => {
        (async () => {
            setScheduleRouteDetail(await Schedule.getRouteDetails(route))
        })()
    }, [])

    useEffect(() => {
        (async () => {
            if (scheduleRouteDetail !== undefined) {
                // console.log(scheduleRouteDetail)
        
                for (let schej of scheduleRouteDetail["schedules"]) {
                    for (let timetables of schej["timetables"]) {
                        // console.log(timetables)
                        scheduleTimeTable?.push(await Schedule.getTimeTable(route, Number(timetables["schedule_number"])))
                    }
                }
            }
        })()
    }, [scheduleRouteDetail])

    console.log(scheduleTimeTable);

    // if (schedule != undefined)
    //     // for (let element of schedule) {
    //     //     console.log(element)
    //     // }
    //     console.log(schedule["agency_id"])

    return (
        <>
            <ol>
                <li></li>
            </ol>
        </>
    )
}

export default SchedulePage;