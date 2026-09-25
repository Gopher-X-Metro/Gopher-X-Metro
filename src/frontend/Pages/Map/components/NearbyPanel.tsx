import React, { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import Live from "src/backend/Live";
import Resources from "src/backend/Resources";

interface StopView {
    id: string;
    name: string;
    lat: number;
    lng: number;
    meters?: number;
    departures?: Live.Departure[];
    alerts?: string[];
    error?: boolean;
}

const FAVORITES_KEY = "gxm-favorite-stops";

/** A departure the rider asked to be told about */
interface Watch {
    stopId: string;
    stopName: string;
    routeName: string;
    tripId: string;
    time: number;
}

// Riders get a heads-up this long before the bus leaves
const NOTIFY_SECONDS = 5 * 60;

/** Reads saved stops, which may be unavailable in private browsing */
function loadFavorites() : StopView[] {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]"); } catch { return []; }
}

function saveFavorites(favorites: StopView[]) : void {
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.map(({ id, name, lat, lng }) => ({ id, name, lat, lng })))); } catch {}
}

/**
 * Panel listing favorite and nearby stops with their next departures and walking times
 */
export default function NearbyPanel({ map, isMobile }: { map: L.Map | null, isMobile: boolean }) {
    const [favorites, setFavorites] = useState<StopView[]>(loadFavorites);
    const [nearby, setNearby] = useState<StopView[]>([]);
    // Opens on its own when there are favorites, except on phones where it would cover the map
    const [open, setOpen] = useState(() => loadFavorites().length > 0 && !window.matchMedia("(max-width: 1024px)").matches);
    const [status, setStatus] = useState("");
    const [colors, setColors] = useState<Record<string, string>>({});
    const [position, setPosition] = useState<{ lat: number, lng: number } | null>(null);
    const container = useRef<HTMLDivElement>(null);
    const [watching, setWatching] = useState<Record<string, Watch>>({});
    const [notice, setNotice] = useState("");

    useEffect(() => {
        if (container.current) {
            L.DomEvent.disableClickPropagation(container.current);
            L.DomEvent.disableScrollPropagation(container.current);
        }
    }, [container, open])

    /** Loads departures for a list of stops */
    const withDepartures = useCallback(async (stops: StopView[]) : Promise<StopView[]> => {
        const loaded = await Promise.all(stops.map(async stop => {
            try {
                const { departures, alerts } = await Live.getDepartures(stop.id);
                return { ...stop, departures: departures.slice(0, 4), alerts };
            } catch {
                return { ...stop, error: true };
            }
        }));
        // Route colors for the chips
        const routeIds = new Set(loaded.flatMap(stop => stop.departures?.map(d => d.routeId) ?? []));
        const found: Record<string, string> = {};
        await Promise.all([...routeIds].map(async id => { found[id] = await Resources.getColor(id); }));
        setColors(previous => ({ ...previous, ...found }));
        return loaded;
    }, [])

    /** Finds stops near the user, or near the middle of the map if location is unavailable */
    const findNearby = useCallback(() => {
        setStatus("Finding stops near you…");
        const search = async (lat: number, lng: number, usedLocation: boolean) => {
            setPosition({ lat, lng });
            const stops = await Live.nearestStops(lat, lng, 5, 800);
            setNearby(await withDepartures(stops));
            setStatus(stops.length === 0
                ? "No stops within a 10 minute walk."
                : usedLocation ? "" : "Showing stops near the middle of the map (location unavailable).");
        };
        const fallback = () => {
            const center = map?.getCenter();
            if (center) search(center.lat, center.lng, false);
        };
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(
                p => search(p.coords.latitude, p.coords.longitude, true),
                fallback,
                { timeout: 8000, maximumAge: 60000 });
        else fallback();
    }, [map, withDepartures])

    // Loads favorites on open, then keeps everything fresh every 30 seconds
    useEffect(() => {
        if (!open) return;
        const refresh = async () => {
            setFavorites(await withDepartures(loadFavorites()));
            setNearby(current => current);
        };
        refresh();
        if (nearby.length === 0 && map) findNearby();
        const interval = setInterval(async () => {
            refresh();
            setNearby(await withDepartures(nearbyRef.current));
        }, 30000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, map])

    const nearbyRef = useRef<StopView[]>([]);
    nearbyRef.current = nearby;

    // Keeps watched departure times current and alerts the rider when one is close
    useEffect(() => {
        const ids = Object.keys(watching);
        if (ids.length === 0) return;
        const check = () => {
            const all = [...favoritesRef.current, ...nearbyRef.current];
            const now = Date.now() / 1000;
            const next = { ...watching };
            let changed = false;
            for (const [key, watch] of Object.entries(watching) as [string, Watch][]) {
                const latest = all.find(stop => stop.id === watch.stopId)?.departures?.find(d => d.tripId === watch.tripId);
                const time = latest?.time ?? watch.time;
                if (time - now <= NOTIFY_SECONDS) {
                    const minutes = Math.max(0, Math.round((time - now) / 60));
                    const message = `${watch.routeName} leaves ${watch.stopName} ${minutes === 0 ? "now" : `in ${minutes} min`}`;
                    try {
                        if ("Notification" in window && Notification.permission === "granted") new Notification("Gopher X Metro", { body: message, tag: key });
                    } catch {}
                    navigator.vibrate?.(300);
                    setNotice("🔔 " + message);
                    delete next[key];
                    changed = true;
                } else if (time !== watch.time) {
                    next[key] = { ...watch, time };
                    changed = true;
                }
            }
            if (changed) setWatching(next);
        };
        check();
        const interval = setInterval(check, 15000);
        return () => clearInterval(interval);
    }, [watching])

    const favoritesRef = useRef<StopView[]>([]);
    favoritesRef.current = favorites;

    const toggleWatch = (stop: StopView, d: Live.Departure) => {
        const key = stop.id + "|" + d.tripId;
        const next = { ...watching };
        const minutes = Math.round((d.time - Date.now() / 1000) / 60);
        if (next[key]) delete next[key];
        else if (d.time - Date.now() / 1000 <= NOTIFY_SECONDS) {
            setNotice(`${d.routeName} leaves ${stop.name} ${minutes <= 0 ? "now" : `in ${minutes} min`}. Head there now!`);
            return;
        } else {
            next[key] = { stopId: stop.id, stopName: stop.name, routeName: d.routeName, tripId: d.tripId, time: d.time };
            try {
                if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
            } catch {}
            setNotice(`We'll alert you 5 min before ${d.routeName} leaves ${stop.name}. Keep this page open.`);
        }
        setWatching(next);
    }

    const isFavorite = (id: string) => favorites.some(f => f.id === id);

    const toggleFavorite = (stop: StopView) => {
        const next = isFavorite(stop.id) ? favorites.filter(f => f.id !== stop.id) : [...favorites, stop];
        saveFavorites(next);
        setFavorites(next);
    }

    const focusStop = (stop: StopView) => {
        map?.setView([stop.lat, stop.lng], 17);
        if (isMobile) setOpen(false);
    }

    const walk = (stop: StopView) => {
        if (stop.meters !== undefined) return Live.walkMinutes(stop.meters);
        if (!position) return undefined;
        return Live.walkMinutes(L.latLng(position).distanceTo([stop.lat, stop.lng]));
    }

    const renderStop = (stop: StopView) => {
        const minutes = walk(stop);
        return (
            <li key={stop.id} className="stop-row">
                <div className="stop-head">
                    <button className="stop-name" onClick={() => focusStop(stop)} title="Show on map">{stop.name}</button>
                    <button className={"star" + (isFavorite(stop.id) ? " on" : "")}
                            onClick={() => toggleFavorite(stop)}
                            aria-label={isFavorite(stop.id) ? "Remove from favorites" : "Add to favorites"}
                            title={isFavorite(stop.id) ? "Remove from favorites" : "Add to favorites"}>
                        {isFavorite(stop.id) ? "★" : "☆"}
                    </button>
                </div>
                {minutes !== undefined && <p className="walk">🚶 {minutes} min walk</p>}
                {stop.alerts?.map((alert, i) => <p key={i} className="stop-alert" onClick={e => e.currentTarget.classList.toggle("full")}>⚠ {alert}</p>)}
                {stop.error && <p className="muted">Couldn't load departures.</p>}
                {stop.departures && stop.departures.length === 0 && <p className="muted">No departures soon.</p>}
                <ul className="departures">
                    {stop.departures?.map((d, i) => {
                        const late = minutes !== undefined && d.time * 1000 - Date.now() < minutes * 60000;
                        return (
                            <li key={i} className={late ? "late" : ""} title={late ? "You may not make this one on foot" : undefined}>
                                <span className="chip" style={{ background: "#" + (colors[d.routeId] ?? "444444") }}>{d.routeName}</span>
                                <span className="dest">{d.description}</span>
                                <span className="time">{d.actual && "📡 "}{d.text}</span>
                                <button className={"bell" + (watching[stop.id + "|" + d.tripId] ? " on" : "")}
                                        onClick={() => toggleWatch(stop, d)}
                                        aria-label={watching[stop.id + "|" + d.tripId] ? "Stop alert" : "Alert me 5 minutes before"}
                                        title={watching[stop.id + "|" + d.tripId] ? "Stop alert" : "Alert me 5 minutes before"}>
                                    {watching[stop.id + "|" + d.tripId] ? "🔔" : "🔕"}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </li>
        );
    }

    return (
        <div ref={container} className={"nearby-panel" + (isMobile ? " mobile" : "") + (open ? " open" : "")}>
            <button className="nearby-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
                {open ? "✕ Close" : "🚏 Stops near me"}
            </button>
            {open && (
                <div className="nearby-body">
                    {favorites.length > 0 && (<>
                        <h4>★ Favorites</h4>
                        <ul>{favorites.map(renderStop)}</ul>
                    </>)}
                    <div className="nearby-header">
                        <h4>Nearby</h4>
                        <button className="refresh" onClick={findNearby} title="Search again from your location">↻</button>
                    </div>
                    {status && <p className="muted">{status}</p>}
                    {notice && <p className="notice" onClick={() => setNotice("")}>{notice}</p>}
                    <ul>{nearby.filter(stop => !isFavorite(stop.id)).map(renderStop)}</ul>
                    <p className="muted legend">📡 = live time from a tracked vehicle. Faded times leave before you could walk there. Tap 🔕 to get an alert 5 min before a bus leaves.</p>
                </div>
            )}
        </div>
    )
}
