import React, { useEffect, useState } from "react";
import Live from "src/backend/Live";
import URL from "src/backend/URL";

const DISMISSED_KEY = "gxm-dismissed-alerts";

function loadDismissed() : Set<string> {
    try { return new Set(JSON.parse(sessionStorage.getItem(DISMISSED_KEY) ?? "[]")); } catch { return new Set(); }
}

/**
 * Shows Metro Transit service alerts for the routes on the map
 */
export default function AlertBanner() {
    const [alerts, setAlerts] = useState<Live.Alert[]>([]);
    const [dismissed, setDismissed] = useState<Set<string>>(loadDismissed);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const refresh = async () => {
            const routes = URL.getRoutes();
            const [metro, campus] = await Promise.all([Live.getAlerts(routes), Live.getCampusNotices(routes)]);
            setAlerts([...campus, ...metro]);
        };
        refresh();
        // Picks up route changes and new alerts
        const interval = setInterval(refresh, 10000);
        return () => clearInterval(interval);
    }, [])

    const visible = alerts.filter(alert => !dismissed.has(alert.id));
    if (visible.length === 0) return null;

    const dismissAll = () => {
        const next = new Set([...dismissed, ...visible.map(alert => alert.id)]);
        try { sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...next])); } catch {}
        setDismissed(next);
    }

    const shown = expanded ? visible : visible.slice(0, 1);

    return (
        <div className="alert-banner" role="status">
            <div className="alert-list">
                {shown.map(alert => (
                    <p key={alert.id}><strong>⚠ {alert.routes.join(", ")}:</strong> {alert.header}</p>
                ))}
                <a className="alert-more" href="https://www.metrotransit.org/routes-services/closures" target="_blank" rel="noreferrer">All Metro Transit alerts</a>
                {" · "}
                <a className="alert-more" href="https://umn.rider.peaktransit.com" target="_blank" rel="noreferrer">Campus bus notices</a>
                {visible.length > 1 && " · "}
                {visible.length > 1 && (
                    <button className="alert-more" onClick={() => setExpanded(!expanded)}>
                        {expanded ? "Show less" : `+${visible.length - 1} more alert${visible.length > 2 ? "s" : ""}`}
                    </button>
                )}
            </div>
            <button className="alert-close" onClick={dismissAll} aria-label="Dismiss alerts">✕</button>
        </div>
    )
}
