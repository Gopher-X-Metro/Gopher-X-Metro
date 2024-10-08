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
    constructor(stopId: string, color: string, name: string, direction: string, location: google.maps.LatLng, map: google.maps.Map) {
        super(stopId, map, new window.google.maps.Circle({
            fillColor: color,
            fillOpacity: 1,
            strokeWeight: 8,
            strokeColor: color,
            center: location,
            radius: 6.5,
            clickable: true,
            strokeOpacity: 0.5,
            map: map
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
        this.setColor(this.departures.size === 0 ? "#F35708" : "#4169e1");

        /**
         * Generate the content of the infowindow
         * @param errorMessage  the error message to replace the content
         */
        const generateContent = async (errorMessage?: string) => {
            const divElement = document.createElement("div");
            divElement.style.cssText = "text-align:center; font-family: Arial, sans-serif;";

            const directionElement = document.createElement("h2");
            directionElement.textContent = this.direction
            directionElement.style.cssText = "margin-bottom: 10px; font-weight: bold; border-bottom: 2px solid #000;";

            const nameElement = document.createElement("p");
            nameElement.textContent = this.name;
            nameElement.style.cssText = "margin-bottom: 20px; font-size: 16px;";

            divElement.appendChild(directionElement);
            divElement.appendChild(nameElement);
            
            if (errorMessage) {
                const errorElement = document.createElement("p");
                errorElement.innerHTML = errorMessage;
                errorElement.style.cssText = "color: red;";

                divElement.appendChild(errorElement);
            } else {
                if (this.departures.size === 0) {
                    const warningElement = document.createElement("p");
                    warningElement.innerHTML = `There are no buses for this stop at this time<br><a href="./schedules" rel="noopener noreferrer">Check the scheduling page for more information</a>`;
                    warningElement.style.cssText = 'color: red;';
                    warningElement.style.fontSize = "12px";
                
                    divElement.appendChild(warningElement);
                }
                else {
                    const listElement = document.createElement("ul")
                    listElement.style.cssText = "margin-top: 20px; list-style: none;";

                    for (const [routeId, departures] of this.departures) {
                        const listItemElement = document.createElement("li");
                        listItemElement.style.cssText = "display: inline-block; margin-left: 10px; margin-right: 10px; vertical-align: text-top;";

                        const buttonElement = document.createElement("button");
                        buttonElement.innerHTML = `<svg width="12" height="12" style="display: block; margin: 0 auto 5px;"><circle cx="6" cy="6" r="6" fill="#${await Resources.getColor(routeId)}"/></svg>`
                        buttonElement.addEventListener("click", () => {
                            if (!URL.getRoutes().has(routeId))
                                URL.addRoute(routeId);
                            else
                                URL.removeRoute(routeId);
                        });

                        const routeIdElement = document.createElement("h3");
                        routeIdElement.innerHTML = `- ${routeId} -`;
                        routeIdElement.style.cssText = "margin-top: 10px;";
                        
                        listItemElement.appendChild(buttonElement);
                        listItemElement.appendChild(routeIdElement);

                        departures.forEach(departure => {
                            const timeElement = document.createElement("p");
                            timeElement.innerHTML = departure.departure_text;
                            timeElement.style.cssText = "margin: 5px 0; font-size: 14px;";
                            
                            listItemElement.appendChild(timeElement);
                        })

                        listElement.append(listItemElement);
                    }
                    
                    divElement.appendChild(listElement);
                }
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
        (this.marker as google.maps.Circle).set("fillColor", color);
        (this.marker as google.maps.Circle).set("strokeColor", color);
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

    /* Depreciated */
    
    /**
     * Sets the description of the info window
     * @param description   the html text for the info window
     * @deprecated
     */
    public setDescription(description: string) : void { this.infoWindow?.setContent(description); }
    /**
     * Updates the info window information
     * @deprecated
     */
    public closeInfoWindow() : void { this.infoWindow?.setVisible(false); }   
}

export default Stop;
