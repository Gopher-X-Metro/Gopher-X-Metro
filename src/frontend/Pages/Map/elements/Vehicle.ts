import L from "leaflet";
import InfoWindowElement from "./abstracts/InfoWindowElement";
import Live from "src/backend/Live.ts";
import Resources from "src/backend/Resources.ts";

class Vehicle extends InfoWindowElement {
    /* Public */

    /**
     * Vehicle Constructor
     * @param vehicleId vehicle ID
     * @param tripId 
     * @param color color of vehicle image
     * @param map map the vehicle displays on
     */
    constructor (vehicleId: string, images: string[2], map: L.Map) {
        const contents = document.createElement("div");
        contents.style.position = "relative";

        super(vehicleId, map, L.marker([0, 0], {
            icon: L.divIcon({ html: contents, className: "", iconSize: [0, 0] }),
        }), [0, -15]);

        // Create bus container
        const busContainer = document.createElement("div");
        busContainer.style.position = "absolute";
        busContainer.style.transform = "translate(-50%, -50%)";

        // Create arrow container
        const arrowContainer = document.createElement("div");
        arrowContainer.style.position = "absolute";
        arrowContainer.style.transform = "translate(-50%, -50%)";

        // Create bus image
        const busImage = document.createElement("img")
        busImage.src = images[0];
        busImage.style.width = "25px";
        busContainer.appendChild(busImage);

        // Create arrow image
        const arrowImage = document.createElement("img")
        arrowImage.src = images[1];
        arrowImage.style.width = "40px";
        arrowContainer.appendChild(arrowImage);

        // Store reference to arrow image and container
        this.arrowImg = arrowImage;
        this.arrowCont = arrowContainer;

        contents.appendChild(busContainer);
        contents.appendChild(arrowContainer);

        // Red "+N" badge for campus buses running late
        this.badge = document.createElement("div");
        this.badge.className = "delay-badge";
        this.badge.hidden = true;
        contents.appendChild(this.badge);
    }
    /**
     * Stores the latest realtime data of the vehicle
     * @param routeId   route the vehicle is running
     * @param info      realtime data from Metro Transit or Peak Transit
     */
    public setInfo(routeId: string, info: any) : void {
        this.routeId = routeId;
        this.info = info;

        const late = info?.nextStopID ? info.minsLate : 0;
        this.badge.hidden = !(late > 1);
        if (late > 1) {
            this.badge.textContent = "+" + late;
            this.badge.title = `About ${late} minutes late`;
        }
    }
    /**
     * Dims stale vehicles and refreshes the info window while it is open
     */
    public updateWindow() {
        const stale = (this.getLastUpdated() ?? 0) > STALE_SECONDS;
        (this.marker as L.Marker).setOpacity(stale ? 0.4 : 1);

        if (!this.infoWindow?.isVisible()) {
            this.windowUpdated = 0;
            return;
        }
        if (Date.now() - this.windowUpdated < 5000) return;
        this.windowUpdated = Date.now();

        this.buildWindow().then(content => this.infoWindow?.setContent(content));
    }
    /**
     * Builds the info window: route, direction, next stop, and how fresh the position is
     */
    private async buildWindow() : Promise<HTMLElement> {
        const div = document.createElement("div");
        div.className = "vehicle-popup";
        const info = this.info ?? {};
        const routeId = this.routeId ?? "";

        const title = document.createElement("h3");
        const color = await Resources.getColor(routeId);
        title.innerHTML = `<span class="route-dot" style="background:#${color}"></span>`;
        title.append(ROUTE_NAMES[routeId] ?? "Route " + routeId);
        div.appendChild(title);

        const lines: string[] = [];
        if (info.direction) lines.push(DIRECTIONS[info.direction] ?? info.direction);

        let nextStop: string | undefined;
        let eta: number | undefined;
        if (info.nextStopID) {
            nextStop = await Live.getPeakStopName(info.nextStopID);
            const arrival = await Live.getPeakEta(info.nextStopID, info.routeID);
            if (arrival) eta = Math.round((arrival - Date.now() / 1000) / 60);
        } else if (this.tripId || this.id) {
            nextStop = await Live.getMetroNextStop(this.tripId ?? this.id);
        }
        if (nextStop) lines.push("Next stop: " + nextStop + (eta !== undefined && eta >= 0 ? ` (${eta === 0 ? "now" : eta + " min"})` : ""));

        // Campus buses report schedule adherence and how full they are
        if (info.nextStopID !== undefined && info.minsLate !== undefined && info.nextStopID)
            lines.push(info.minsLate > 1 ? `About ${info.minsLate} min late` : info.minsLate < -1 ? `About ${-info.minsLate} min early` : "On time");
        if (info.HasAPC && info.APCPercentage > 0)
            lines.push(info.APCPercentage >= 90 ? "Crowded (standing room only)" : info.APCPercentage >= 50 ? "Some seats open" : "Plenty of seats");

        const age = Math.round(this.getLastUpdated() ?? 0);
        lines.push(age > STALE_SECONDS 
            ? `Location may be out of date (${Math.round(age / 60)} min old)` 
            : `Location updated ${age < 5 ? "just now" : age + "s ago"}`);

        lines.forEach((line, i) => {
            const p = document.createElement("p");
            p.textContent = line;
            if (i === lines.length - 1) p.className = "muted";
            div.appendChild(p);
        });
        return div;
    }
    /**
     * Gets the length in ms of the time between when position was updated and now
     */
    public getLastUpdated() : number | undefined {
        if (this.positionTimestamp)
            return (Date.now()/1000) - this.positionTimestamp; 
    }
    /**
     * Get the trip ID
     */
    public getTripId() : string | undefined { return this.tripId; }
    /**
     * Sets the trip ID
     * @param tripId trip ID
     */
    public setTripId(tripId : string) : void { this.tripId = tripId; }
    /**
     * Sets the position of the vehicle on the map
     * @param position position of the vehicle
     * @param timestamp when this position was updated
     */
    public setPosition(position : L.LatLng, timestamp : number) : void {
        if (!(this.marker as L.Marker).getLatLng().equals(position)) {
            this.infoWindow?.setPosition(position);
            this.glideTo(position);
            this.positionTimestamp = timestamp;
        }
    }
    /**
     * Moves the icon smoothly to a new position instead of jumping
     * @param position the new position
     */
    private glideTo(position: L.LatLng) : void {
        const marker = this.marker as L.Marker;
        const from = marker.getLatLng();
        if (this.glide) cancelAnimationFrame(this.glide);

        // Jump when there's nothing to glide from, the tab is hidden, or the move is too far to be driving
        if ((from.lat === 0 && from.lng === 0) || document.hidden || from.distanceTo(position) > 1500) {
            marker.setLatLng(position);
            return;
        }

        const start = performance.now();
        const step = (now: number) => {
            const t = Math.min(1, (now - start) / GLIDE_MS);
            const ease = t * (2 - t);
            marker.setLatLng([from.lat + (position.lat - from.lat) * ease, from.lng + (position.lng - from.lng) * ease]);
            if (t < 1) this.glide = requestAnimationFrame(step);
        };
        this.glide = requestAnimationFrame(step);
    }
    /**
     * Gets the direction the bus is heading
     */
    public getBusBearing(): number | undefined { return this.bearing; }
    /**
     * Sets the direction the bus is heading
     * @param bearing the orientation of the bus
     */
    public setBusBearing(bearing: number): void {
        this.bearing = bearing;
        if (this.arrowImg) {
            this.arrowImg.style.transform = `rotate(${bearing}deg)`;
            this.setArrowImageOrientation(bearing);
        }
    }
    /**
     * Gets the direction the lightrail is heading
     */
    public getDirectionID(): number | undefined { return this.direction_id; }
    /**
     * Returns if the vehicle position has been updated
     */
    public isPositionUpdated(): boolean { return this.getLastUpdated() as number < 300 }
    /**
     * Sets the updated status of the vehicle
     * @param bool the new updated status
     */
    public updateTimestamp() : void { this.updatedTimestamp = Date.now(); }
    /**
     * Returns if the vehicle had been updated
     */
    public isUpdated(): boolean { return (this.updatedTimestamp && this.isPositionUpdated()) ? (Date.now() - this.updatedTimestamp < 500) : false; }
    /**
     * Sets the direction the blueline lightrail is heading
     * @param direction_id the orientation of the blueline lightrail
     */
    public setBlueDirectionID(direction_id: number): void {
        this.direction_id = direction_id;
        if (this.arrowImg) {
            this.setArrowImageBluelineOrientation(direction_id);
        }
    }
    /**
     * Sets the direction the greenline lightrail is heading
     * @param direction_id the orientation of the greenline lightrail
     */
    public setGreenDirectionID(direction_id: number): void {
        this.direction_id = direction_id;
        if (this.arrowImg) {
            this.setArrowImageGreenlineOrientation(direction_id);
        }
    }
    /**
     * Sets position of bus arrow image around center of bus image
     * @param bearing the orientation of the bus
     */
    public setArrowImageOrientation(bearing: number) : void {
        const radius = 10;
        const radians = (bearing + 90) / 180 * Math.PI;
        
        if (this.arrowCont) {
            this.arrowCont.style.top = (-Math.sin(radians) * radius).toString() + "px";
            this.arrowCont.style.left = (-Math.cos(radians) * radius).toString() + "px";
        }
    }
    /**
     * Sets position of bus arrow image around center of bus image
     * @param direction_id the orientation of the blueline lightrail
     */
    public setArrowImageBluelineOrientation(direction_id: number) : void {
        if (this.arrowCont && this.arrowImg) {
            if (direction_id === 0) {
                this.arrowImg.style.transform = `rotate(${0}deg)`;
                this.arrowCont.style.top = "-10px";
            } else if (direction_id === 1) {
                this.arrowImg.style.transform = `rotate(${180}deg)`;
                this.arrowCont.style.top = "10px";
            }
        }
    }
    /**
     * Sets position of bus arrow image around center of bus image
     * @param direction_id the orientation of the greenline lightrail
     */
    public setArrowImageGreenlineOrientation(direction_id: number) : void {
        if (this.arrowCont && this.arrowImg) {
            if (direction_id === 0) {
                this.arrowImg.style.transform = `rotate(${90}deg)`;
                this.arrowCont.style.left = "10px";
            } else if (direction_id === 1) {
                this.arrowImg.style.transform = `rotate(${270}deg)`;
                this.arrowCont.style.left = "-10px";
            }
        }
    }
    
    /* Private */
    private routeId: string | undefined;
    private info: any;
    private windowUpdated = 0;
    private glide = 0;
    private badge: HTMLDivElement;
    private updatedTimestamp: number | undefined;
    private tripId: string | undefined;
    private positionTimestamp : number | undefined;
    private bearing: number | undefined;
    private direction_id: number | undefined;
    private arrowImg: HTMLImageElement | null = null;
    private arrowCont: HTMLDivElement;
}

const STALE_SECONDS = 120;
const GLIDE_MS = 1500;

const DIRECTIONS = { NB: "Northbound", SB: "Southbound", EB: "Eastbound", WB: "Westbound" };

export const ROUTE_NAMES = {
    "120": "120 East Bank Circulator",
    "121": "121 Campus Connector",
    "122": "122 University Ave Circulator",
    "123": "123 4th Street Circulator",
    "124": "124 St. Paul Circulator",
    "125": "125 Dinkytown Connector",
    "126": "126 Campus Express",
    "901": "METRO Blue Line",
    "902": "METRO Green Line",
    "925": "METRO E Line",
};

export default Vehicle;