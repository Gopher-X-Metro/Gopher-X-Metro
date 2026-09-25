import L from 'leaflet';
import Live from 'src/backend/Live.ts';
import InfoWindowElement from './abstracts/InfoWindowElement';

import Resources from 'src/backend/Resources.ts';
import URL from 'src/backend/URL.ts';
import Primative from './abstracts/Primative';

interface departure {
    routeId: string;
    tripId: string;
    departure_text: string;
    departure_time: number;
    direction_text: string;
    description: string;
}

class Stop extends InfoWindowElement {
    /* Public */

    /**
     * Stop Constructor
     * @param stopId ID of the stop
     * @param color color of the stop
     * @param location location of the stop
     * @param map map the stop displays on
     */
    constructor(stopId: string, color: string, name: string, direction: string, location: L.LatLng, map: L.Map) {
        super(stopId, map, L.circleMarker(location, {
            fillColor: color,
            fillOpacity: 1,
            weight: stopSize(map.getZoom()).weight,
            color: color,
            radius: stopSize(map.getZoom()).radius,
            opacity: 0.35,
            bubblingMouseEvents: false,
            pane: stopPane(map)
        }));

        this.departures = new Map<string, Array<departure>>();
        this.elements = new Set<Primative>();

        this.name = name;
        this.direction = direction;

        this.updateWindow();
    }
    /**
     * Updates the info window information
     */
    public async updateWindow() : Promise<void> {
        this.setColor(this.departures.size === 0 ? STOP_IDLE : STOP_ACTIVE);

        /**
         * Generate the content of the infowindow
         * @param errorMessage  the error message to replace the content
         */
        const generateContent = async (errorMessage?: string) => {
            const divElement = document.createElement("div");
            divElement.className = "stop-popup";

            const nameElement = document.createElement("h3");
            nameElement.textContent = this.name;
            divElement.appendChild(nameElement);

            if (this.direction) {
                const directionElement = document.createElement("p");
                directionElement.className = "stop-popup-direction";
                directionElement.textContent = this.direction;
                divElement.appendChild(directionElement);
            }

            if (errorMessage) {
                const errorElement = document.createElement("p");
                errorElement.className = "stop-popup-empty";
                errorElement.textContent = errorMessage;
                divElement.appendChild(errorElement);
            } else if (this.departures.size === 0) {
                const warningElement = document.createElement("p");
                warningElement.className = "stop-popup-empty";
                warningElement.textContent = "No buses scheduled here right now. ";
                const link = document.createElement("a");
                link.textContent = "See schedules";
                link.href = "#";
                link.addEventListener("click", event => {
                    event.preventDefault();
                    document.dispatchEvent(new CustomEvent("gxm:open-page", { detail: "schedules" }));
                });
                warningElement.appendChild(link);
                divElement.appendChild(warningElement);
            } else {
                // One row per route: tappable route chip, then its next few times
                const listElement = document.createElement("ul");
                for (const [routeId, departures] of this.departures) {
                    const row = document.createElement("li");

                    const chip = document.createElement("button");
                    chip.className = "stop-popup-chip";
                    chip.textContent = ROUTE_CHIPS[routeId] ?? routeId;
                    chip.style.background = "#" + await Resources.getColor(routeId);
                    chip.title = URL.getRoutes().has(routeId) ? "Hide this route" : "Show this route on the map";
                    chip.addEventListener("click", event => {
                        event.stopPropagation();
                        if (!URL.getRoutes().has(routeId)) URL.addRoute(routeId);
                        else URL.removeRoute(routeId);
                    });
                    row.appendChild(chip);

                    const times = document.createElement("span");
                    times.className = "stop-popup-times";
                    departures.slice(0, DEPARTURES_SHOWN).forEach((departure, i) => {
                        const time = document.createElement("span");
                        time.textContent = Live.formatDeparture(departure.departure_text, departure.departure_time);
                        if (i === 0) time.className = "next";
                        times.appendChild(time);
                    });
                    row.appendChild(times);
                    listElement.appendChild(row);
                }
                divElement.appendChild(listElement);
            }

            return divElement;
        }

        // Load infowindow
        try {
            this.infoWindow?.setContent(await generateContent());
        } catch (e) {
            console.error(`Failed to update info window:`, e);
            this.infoWindow?.setContent(await generateContent("Failed to load departure information."));
        }
    }
    /**
     * Adds a departure to the route
     * @param routeId            route the departure is for
     * @param tripId             the trip id of the departure
     * @param departure_text     text of the departure time
     * @param direction_text     text of departure direction
     * @param description        description of departure
     * @param departure_time     time of departure epoch
     */
    public addDeparture(routeId: string, tripId: string, departure_text: string, direction_text: string, description: string, departure_time: number) : void {
        if (!this.departures.has(routeId))
            this.departures.set(routeId, new Array<departure>())

        this.departures.get(routeId)?.push({
            routeId: routeId,
            tripId: tripId,
            departure_text: departure_text,
            direction_text: direction_text,
            description: description,
            departure_time: departure_time
        })
    }
    /**
     * Clears all departures
     */
    public clearDepartures() : void { this.departures.clear() }
    /**
     * Changes the color of the stop
     * @param color  the new color
     */
    public setColor(color: string) : void {
        (this.marker as L.CircleMarker).setStyle({ fillColor: color, color: color });
    }
    /**
     * Resizes the stop for the map's zoom level
     * @param zoom the map's zoom level
     */
    public setZoomSize(zoom: number) : void {
        const size = stopSize(zoom);
        (this.marker as L.CircleMarker).setRadius(size.radius);
        (this.marker as L.CircleMarker).setStyle({ weight: size.weight });
    }
    /**
     * Adds an element to the set of elements
     * @param element   the element to add
     */
    public addElement(element: Primative) : void { this.elements.add(element); }
    /**
     * Updates the visibility baised on which elements are visible
     */
    public updateVisibility() : void {
        let visible = false;

        this.elements.forEach(element => {
            if (element.isVisible()) {
                visible = true
                return;
            }
        })

        this.setVisible(visible); 
    }
 
    /* Private */

    private name: string;
    private departures: Map<string, Array<departure>>;
    private direction: string;
    private elements: Set<Primative>;
}

const DEPARTURES_SHOWN = 5;

// Stops with upcoming buses stand out; ones without fade back
const STOP_ACTIVE = "#1f5fbf";
const STOP_IDLE = "#9aa3ad";

/** Short labels for route chips */
const ROUTE_CHIPS = { "901": "Blue", "902": "Green", "925": "E Line", "FOOTBALL": "Football" };

/** Stops get their own layer above route lines, so a line never covers a stop's tap target */
function stopPane(map: L.Map) : string {
    if (!map.getPane("stops")) map.createPane("stops").style.zIndex = "450";
    return "stops";
}

/** Stops shrink when zoomed in close, so stops on opposite sides of a street don't overlap */
function stopSize(zoom: number) : { radius: number, weight: number } {
    if (zoom >= 18) return { radius: 5, weight: 5 };
    if (zoom >= 17) return { radius: 6, weight: 7 };
    return { radius: 7, weight: 10 };
}

export default Stop;
