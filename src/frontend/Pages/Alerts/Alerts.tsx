import React, { useEffect, useState } from 'react';
import { Button } from '@chakra-ui/react';

import Live from 'src/backend/Live';
import URL from 'src/backend/URL';

import "../Schedule/schedules.css";
import "./alerts.css";

// Routes listed in the sidebar, plus any the rider has added
const SIDEBAR_ROUTES = ["120", "121", "122", "123", "124", "125", "126", "2", "3", "925", "901", "902"];

const ROUTE_LABELS = { "901": "Blue Line", "902": "Green Line", "925": "E Line" };

function date(seconds?: number) : string {
    return seconds ? new Date(seconds * 1000).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";
}

/**
 * Campus bus notices and Metro Transit service alerts, in two sections
 */
export default function Alerts({ hidden, setPage }) {
    const [campus, setCampus] = useState<Live.Alert[] | undefined>();
    const [metro, setMetro] = useState<Live.Alert[] | undefined>();

    useEffect(() => {
        if (hidden) return;
        const routes = new Set([...SIDEBAR_ROUTES, ...URL.getRoutes()]);
        Live.getCampusNotices(null, 30).then(setCampus);
        Live.getAlerts(routes).then(alerts => setMetro(alerts
            .filter(alert => !alert.routes.every(route => /^12[0-6]$/.test(route)))
            .sort((a, b) => (b.start ?? 0) - (a.start ?? 0))));
    }, [hidden])


    const card = (alert: Live.Alert, when: string) => (
        <li key={alert.id} className="alert-card">
            <div className="alert-routes">
                {alert.routes.map(route => <span key={route} className="alert-route">{ROUTE_LABELS[route] ?? route}</span>)}
                <span className="alert-date">{when}</span>
            </div>
            <p className="alert-title">{(alert as any).title ?? alert.header}</p>
            {alert.description && alert.description !== alert.header && <p className="alert-body">{alert.description}</p>}
        </li>
    );

    return (
        <div hidden={hidden} className="schedules-page">
            <h1 className="schedules-title">Bus Alerts</h1>
            <div className="schedules-controls">
                <Button colorScheme='yellow' onClick={() => setPage("map")}>
                    Back to Map
                </Button>
            </div>

            <section className="alerts-section">
                <h2 className="alerts-heading">Campus Buses</h2>
                <p className="schedules-note">Notices from University Parking & Transportation Services in the last 30 days, newest first.</p>
                {campus === undefined && <p className="schedules-note">Loading…</p>}
                {campus?.length === 0 && <p className="schedules-note">No campus bus notices in the last 30 days.</p>}
                <ul>{campus?.map(alert => card(alert, "Posted " + date(alert.created)))}</ul>
                <a className="alerts-link" href="https://umn.rider.peaktransit.com" target="_blank" rel="noreferrer">Campus rider site</a>
            </section>

            <section className="alerts-section">
                <h2 className="alerts-heading">Metro Transit</h2>
                <p className="schedules-note">Alerts in effect now for the routes on this site.</p>
                {metro === undefined && <p className="schedules-note">Loading…</p>}
                {metro?.length === 0 && <p className="schedules-note">No active alerts for these routes.</p>}
                <ul>{metro?.map(alert => card(alert, alert.end ? "Until " + date(alert.end) : alert.start ? "Since " + date(alert.start) : ""))}</ul>
                <a className="alerts-link" href="https://www.metrotransit.org/routes-services/closures" target="_blank" rel="noreferrer">All Metro Transit closures and detours</a>
            </section>
        </div>
    )
}
