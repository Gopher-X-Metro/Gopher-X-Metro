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

    // Collapsed, the banner is one line so it doesn't cover the map
    if (!expanded) return (
        <div className="alert-banner collapsed" role="status">
            <button className="alert-summary" onClick={() => setExpanded(true)} aria-expanded="false">
                <span className="alert-icon">⚠</span>
                <span className="alert-summary-text">
                    <strong>{visible[0].routes.map(label).join(", ")}</strong> {visible[0].header}
                </span>
                {visible.length > 1 && <span className="alert-count">+{visible.length - 1}</span>}
            </button>
            <button className="alert-close" onClick={dismissAll} aria-label="Dismiss alerts">✕</button>
        </div>
    );

    return (
        <div className="alert-banner" role="status">
            <div className="alert-list">
                {visible.map(alert => (
                    <p key={alert.id}><strong>⚠ {alert.routes.map(label).join(", ")}:</strong> {alert.header}</p>
                ))}
                <p className="alert-links">
                    <button className="alert-more" onClick={() => document.dispatchEvent(new CustomEvent("gxm:open-page", { detail: "alerts" }))}>All bus alerts</button>
                    {" · "}
                    <button className="alert-more" onClick={() => setExpanded(false)}>Show less</button>
                </p>
            </div>
            <button className="alert-close" onClick={dismissAll} aria-label="Dismiss alerts">✕</button>
        </div>
    )
}

const LABELS = { "901": "Blue Line", "902": "Green Line", "925": "E Line", "FOOTBALL": "Football" };
const label = (route: string) => LABELS[route] ?? route;
