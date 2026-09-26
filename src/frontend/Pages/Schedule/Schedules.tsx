import React, { useEffect, useState } from 'react';

import { ChevronDownIcon } from '@chakra-ui/icons';

import {
    Menu,
    MenuButton,
    MenuList,
    MenuItemOption,
    MenuOptionGroup,
    MenuDivider,
    Button,
} from '@chakra-ui/react';

import "./schedules.css";
import PageHeader from "../PageHeader";

const CAMPUS_ROUTES: [string, string][] = [
    ["120", "120 East Bank Circulator"],
    ["121", "121 Campus Connector"],
    ["122", "122 University Avenue Circulator"],
    ["123", "123 4th Street Circulator"],
    ["124", "124 St. Paul Circulator"],
    ["125", "125 Dinkytown Connector"],
    ["126", "126 Campus Express"],
];

const METRO_ROUTES: [string, string][] = [
    ["902", "METRO Green Line"],
    ["901", "METRO Blue Line"],
    ["925", "METRO E Line"],
    ["2", "2 Franklin Av / To Hennepin"],
    ["3", "3 U of M / Como Av / Dwtn Mpls"],
];

const DAY_LABELS = { Weekday: "Monday–Friday", Saturday: "Saturday", Sunday: "Sunday" };

const DIRECTIONS = { NB: "Northbound", SB: "Southbound", EB: "Eastbound", WB: "Westbound" };

interface DirectionSchedule {
    direction: string;
    headsign: string;
    trips: number;
    spans: [number, number, number | null][];
}

/** Seconds after midnight (can pass 24:00) to "7:40 AM" */
function clock(seconds: number) : string {
    const minutes = Math.round(seconds / 60) % (24 * 60);
    const h = Math.floor(minutes / 60), m = minutes % 60;
    return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/**
 * When each route runs and how often, built weekly from Metro Transit's schedule data
 */
export default function Schedules({ hidden, setPage }) {
    const [routeId, setRouteId] = useState("121");
    const [schedule, setSchedule] = useState<Record<string, DirectionSchedule[]> | null | undefined>(undefined);

    const name = [...CAMPUS_ROUTES, ...METRO_ROUTES].find(([id]) => id === routeId)?.[1] ?? routeId;

    useEffect(() => {
        // Lets a stop popup on the map pick which route to show
        const open = (event: Event) => setRouteId((event as CustomEvent).detail);
        document.addEventListener("gxm:open-schedule", open);
        return () => document.removeEventListener("gxm:open-schedule", open);
    }, [])

    useEffect(() => {
        setSchedule(undefined);
        fetch(process.env.PUBLIC_URL + "/gtfs/schedules/" + routeId + ".json")
            .then(response => response.ok && response.headers.get("content-type")?.includes("json") ? response.json() : null)
            .then(setSchedule)
            .catch(() => setSchedule(null));
    }, [routeId])

    const option = ([id, label]: [string, string]) => (
        <MenuItemOption key={id} value={id} onClick={() => setRouteId(id)}>{label}</MenuItemOption>
    );

    return (
        <div hidden={hidden} className="schedules-page-wrap">
            <PageHeader title="Schedules" setPage={setPage}/>
            <div className="schedules-page">
            <div className="schedules-controls">
                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                        {name}
                    </MenuButton>
                    <MenuList maxHeight="70vh" overflowY="auto">
                        <MenuOptionGroup value={routeId} title="Campus Buses" type='radio'>
                            {CAMPUS_ROUTES.map(option)}
                        </MenuOptionGroup>
                        <MenuDivider />
                        <MenuOptionGroup value={routeId} title="Metro Transit" type='radio'>
                            {METRO_ROUTES.map(option)}
                        </MenuOptionGroup>
                    </MenuList>
                </Menu>
            </div>

            <h2 className="schedules-title">{name}</h2>

            {schedule === undefined && <p className="schedules-note">Loading…</p>}

            {schedule === null && (
                <p className="schedules-note">
                    Metro Transit doesn't publish a schedule for this route. See the{" "}
                    <a href="https://umn.rider.peaktransit.com" target="_blank" rel="noreferrer">campus rider site</a>{" "}
                    or <a href="https://pts.umn.edu/transit/campus" target="_blank" rel="noreferrer">Parking & Transportation Services</a>.
                </p>
            )}

            {schedule && (["Weekday", "Saturday", "Sunday"] as const).map(day => (
                <section key={day} className="schedule-day">
                    <h2>{DAY_LABELS[day]}</h2>
                    {!schedule[day] ? <p className="schedules-note">No service</p> : schedule[day].map(direction => (
                        <div key={direction.direction} className="schedule-direction">
                            <h3>{DIRECTIONS[direction.direction] ?? direction.direction} <span>to {direction.headsign}</span></h3>
                            <table>
                                <tbody>
                                    {direction.spans.map(([from, to, every], i) => (
                                        <tr key={i}>
                                            <td>{from === to ? clock(from) : `${clock(from)} – ${clock(to)}`}</td>
                                            <td>{every ? `every ${every} min` : "one trip"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </section>
            ))}

            {schedule && (
                <p className="schedules-note">
                    Times are when trips leave the first stop, taken from Metro Transit's published schedule
                    and refreshed weekly. Late-night service can differ on Thursday and Friday.
                </p>
            )}
            </div>
        </div>
    )
}
