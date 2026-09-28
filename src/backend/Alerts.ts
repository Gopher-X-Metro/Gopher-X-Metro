import Live from "./Live";

/**
 * "Alert me" bells: riders pick a departure and get a notification shortly before it leaves.
 * Shared by the Nearby panel and the stop popups, so a bell set in one shows as set in the other.
 */
namespace Alerts {
    /** Riders get a heads-up this long before the bus leaves */
    export const NOTIFY_SECONDS = 5 * 60;
    /** Riders also get alerted when the bus is this close to the stop (half a mile), in case it runs early */
    export const NOTIFY_METERS = 800;

    export interface Watch {
        stopId: string;
        stopName: string;
        routeName: string;
        tripId: string;
        time: number;
        /** Set inside the 5 min window: only fire once the bus is close or about to leave */
        late?: boolean;
    }

    /** If this departure has an alert set */
    export function isWatching(stopId: string, tripId: string) : boolean {
        return watches.has(key(stopId, tripId));
    }

    /** If any departure of this route at this stop has an alert set */
    export function isWatchingRoute(stopId: string, routeName: string) : boolean {
        return [...watches.values()].some(w => w.stopId === stopId && w.routeName === routeName);
    }

    /**
     * Sets or clears the alert for a departure
     * @returns the message to show the rider
     */
    export function toggle(watch: Watch) : string {
        const k = key(watch.stopId, watch.tripId);
        const seconds = watch.time - Date.now() / 1000;
        let message: string;
        if (watches.delete(k)) {
            message = `Alert off for ${watch.routeName} at ${watch.stopName}.`;
        } else if (seconds <= 60) {
            return notify(`${watch.routeName} leaves ${watch.stopName} now. Head there now!`);
        } else {
            const late = seconds <= NOTIFY_SECONDS;
            watches.set(k, { ...watch, late });
            try {
                if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
            } catch {}
            message = late
                ? `${watch.routeName} leaves ${watch.stopName} in ${Math.round(seconds / 60)} min. We'll alert you again when it's close.`
                : `We'll alert you 5 min before ${watch.routeName} leaves ${watch.stopName}, or sooner if it's close. Keep this page open.`;
            start();
        }
        changed();
        return notify(message);
    }

    /**
     * Bell on a stop popup's route row: alerts for that route's next bus, or clears the alert set for it
     * @param next the route's upcoming departures at this stop, soonest first
     */
    export function toggleRoute(stopId: string, stopName: string, routeName: string, next: Array<{ tripId: string, time: number }>) : string {
        const existing = [...watches.values()].find(w => w.stopId === stopId && w.routeName === routeName);
        if (existing) return toggle(existing);
        if (!next.length) return notify(`No upcoming ${routeName} at ${stopName}.`);
        return toggle({ stopId, stopName, routeName, tripId: next[0].tripId, time: next[0].time });
    }

    /** Builds the bell button used in stop popups */
    export function routeBell(stopId: string, stopName: string, routeName: string, next: Array<{ tripId: string, time: number }>) : HTMLButtonElement {
        const bell = document.createElement("button");
        bell.className = "stop-popup-bell";
        const render = () => {
            const on = isWatchingRoute(stopId, routeName);
            bell.textContent = on ? "🔔" : "🔕";
            bell.classList.toggle("on", on);
            bell.title = on ? "Stop alert" : `Alert me 5 min before the next ${routeName}`;
            bell.setAttribute("aria-label", bell.title);
        };
        render();
        bell.addEventListener("click", event => {
            event.stopPropagation();
            toggleRoute(stopId, stopName, routeName, next);
            render();
        });
        return bell;
    }

    /** Runs when alerts are set, cleared or fire */
    export function addListener(fn: () => void) : () => void {
        listeners.add(fn);
        return () => { listeners.delete(fn); };
    }

    /** Runs with each message for the rider (alert set, cleared or firing) */
    export function onNotice(fn: (message: string) => void) : () => void {
        noticeListeners.add(fn);
        return () => { noticeListeners.delete(fn); };
    }

    /* Private */

    const watches = new Map<string, Watch>();
    const listeners = new Set<() => void>();
    const noticeListeners = new Set<(message: string) => void>();
    let timer: ReturnType<typeof setInterval> | undefined;

    function key(stopId: string, tripId: string) { return stopId + "|" + tripId; }

    function changed() { listeners.forEach(fn => fn()); }

    function notify(message: string) : string {
        noticeListeners.forEach(fn => fn(message));
        toast(message);
        return message;
    }

    /** Brief on-screen message, visible whether or not the Nearby panel is open */
    let toastTimer: ReturnType<typeof setTimeout> | undefined;
    function toast(message: string) {
        let el = document.getElementById("alert-toast");
        if (!el) {
            el = document.createElement("div");
            el.id = "alert-toast";
            el.setAttribute("role", "status");
            el.addEventListener("click", () => el!.classList.remove("show"));
            document.body.appendChild(el);
        }
        el.textContent = message;
        el.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el!.classList.remove("show"), 5000);
    }

    /**
     * Full-screen alert when a watched bus is about to leave, so it can't be missed.
     * Stays up until dismissed; several alerts at once stack into the same card.
     */
    function showAlert(watch: Watch, minutes: number) {
        document.getElementById("alert-toast")?.classList.remove("show");
        let overlay = document.getElementById("bus-alert");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "bus-alert";
            overlay.setAttribute("role", "alertdialog");
            overlay.setAttribute("aria-modal", "true");
            overlay.setAttribute("aria-labelledby", "bus-alert-title");
            overlay.innerHTML = `<div class="bus-alert-card">
                <button class="bus-alert-close" aria-label="Dismiss">✕</button>
                <div class="bus-alert-bell" aria-hidden="true">🔔</div>
                <h2 id="bus-alert-title">Your bus is almost here</h2>
                <ul class="bus-alert-list"></ul>
                <button class="bus-alert-ok">Got it</button>
            </div>`;
            const close = () => { overlay!.remove(); document.removeEventListener("keydown", onKey); };
            const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
            overlay.querySelector(".bus-alert-close")!.addEventListener("click", close);
            overlay.querySelector(".bus-alert-ok")!.addEventListener("click", close);
            overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
            document.addEventListener("keydown", onKey);
            document.body.appendChild(overlay);
        }
        const item = document.createElement("li");
        const route = document.createElement("strong");
        route.textContent = watch.routeName;
        const when = document.createElement("span");
        when.className = "bus-alert-when";
        when.textContent = minutes === 0 ? "leaving now" : `leaves in ${minutes} min`;
        const stop = document.createElement("span");
        stop.className = "bus-alert-stop";
        stop.textContent = "from " + watch.stopName;
        item.append(route, when, stop);
        overlay.querySelector(".bus-alert-list")!.appendChild(item);
        (overlay.querySelector(".bus-alert-ok") as HTMLButtonElement).focus();
    }

    function start() {
        timer ??= setInterval(check, 15000);
    }

    /** Refreshes watched departure times (buses run early or late) and fires alerts that are due */
    async function check() {
        if (watches.size === 0) {
            clearInterval(timer);
            timer = undefined;
            return;
        }
        const stopIds = [...new Set([...watches.values()].map(w => w.stopId))];
        const latest = new Map<string, Live.Departure[]>();
        await Promise.all(stopIds.filter(id => !id.startsWith("peak-")).map(async id => {
            try { latest.set(id, (await Live.getDepartures(id)).departures); } catch {}
        }));

        const now = Date.now() / 1000;
        let any = false;
        for (const [k, watch] of [...watches]) {
            const time = latest.get(watch.stopId)?.find(d => d.tripId === watch.tripId)?.time ?? watch.time;
            watch.time = time;
            const threshold = watch.late ? 60 : NOTIFY_SECONDS;
            if (time - now > threshold) {
                // Bus running ahead of its prediction: fire once it's close to the stop
                const meters = watch.stopId.startsWith("peak-") ? undefined : await Live.busDistanceToStop(watch.tripId, watch.stopId).catch(() => undefined);
                if (meters === undefined || meters > NOTIFY_METERS) continue;
            }

            const minutes = Math.max(0, Math.round((time - now) / 60));
            const message = `${watch.routeName} leaves ${watch.stopName} ${minutes === 0 ? "now" : `in ${minutes} min`}`;
            try {
                if ("Notification" in window && Notification.permission === "granted") new Notification("Gopher X Metro", { body: message, tag: k });
            } catch {}
            navigator.vibrate?.(300);
            noticeListeners.forEach(fn => fn("🔔 " + message));
            showAlert(watch, minutes);
            watches.delete(k);
            any = true;
        }
        if (any) changed();
    }
}

export default Alerts;
