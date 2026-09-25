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
    const [open, setOpen] = useState(() => loadFavorites().length > 0);
    const [status, setStatus] = useState("");
    const [colors, setColors] = useState<Record<string, string>>({});
    const [position, setPosition] = useState<{ lat: number, lng: number } | null>(null);
    const container = useRef<HTMLDivElement>(null);

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
                {stop.alerts?.map((alert, i) => <p key={i} className="stop-alert">⚠ {alert}</p>)}
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
                    <ul>{nearby.filter(stop => !isFavorite(stop.id)).map(renderStop)}</ul>
                    <p className="muted legend">📡 = live time from a tracked vehicle. Faded times leave before you could walk there.</p>
                </div>
            )}
        </div>
    )
}
