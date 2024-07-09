import Element from "../Element.ts";
import StopInfoWindow from "./StopInfoWindow.ts";

interface departure {
    routeId: string;
    tripId: string;
    departure_text: string;
    departure_time: number;
    direction_text: string;
    description: string;
}

class Stop extends Element {
    /* Public */

    /**
     * Stop Constructor
     * @param stopId ID of the stop
     * @param color color of the stop
     * @param location location of the stop
     * @param map map the stop displays on
     */
    constructor(stopId: string, color: string, name: string, direction: string, location: google.maps.LatLng, map: google.maps.Map) {
        super(stopId, color, map);
        this.location = location;

        this.marker = new window.google.maps.Circle({
            fillColor: color,
            fillOpacity: 1,
            strokeWeight: 8,
            strokeColor: color,
            center: this.location,
            radius: 6.5,
            clickable: true,
            strokeOpacity: 0.5,
            map: map
        });

        this.infoWindow = new StopInfoWindow(this.marker, location, map);

        this.departures = new Map<string, Array<departure>>();

        this.name = name;
        this.direction = direction;
    }
    /**
     * Gets the marker object on the map
     */
    public getMarker() : google.maps.Circle { return this.marker; }
    /**
     * Updates the info window information
     */
    public updateInfoWindow() : void {
        this.infoWindow.setContent(
            "<div style=\"text-align:center; font-family: Arial, sans-serif;\">" +
                "<h2 style=\"margin-bottom: 10px;\">" + this.direction + "</h2>" +
                "<p style=\"margin-bottom: 20px; font-size: 16px;\">" + this.name + "</p>" +
                "<ul style=\"margin-top: 20px; list-style: none;\">" + this.infoWindowBody() +
                "</ul>" +
            "</div>"
        )
    }
    /**
     * The body of the infowindow
     */
    public infoWindowBody() {
        let output = ""

        for (const route of this.departures) {
            output += "<li style=\"display: inline-block; margin-left: 10px; margin-right: 10px; vertical-align: text-top;\">"
            output += "<h3 style=\"margin-top: 10px;\">- " + route[0] + " -</h3>"
            output += route[1].map(departure => "<p style=\"margin: 5px 0; font-size: 14px;\">" + departure.departure_text + "</p>").join("")
            output += "</li>"
        }

        return ( output )
    }
    /**
     * Updates the info window information
     */
    public closeInfoWindow() : void { this.infoWindow.close(); }
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
     * Sets the description of the info window
     * @param description   the html text for the info window
     * @deprecated
     */
    public setDescription(description: string) : void { this.infoWindow.setContent(description); }
    /**
     * Changes the color of the stop
     * @param color  the new color
     */
    public setColor(color: string) : void { 
        this.marker.set("fillColor", color);
        this.marker.set("strokeColor", color);
    }
    /**
     * Sets the visibility of the stop
     * @param visible   if the stop should be visible
     */
    public setVisible(visible: boolean) : void { this.getMarker().setMap(visible ? this.map : null); }

    /* Private */
    private name: string;
    private infoWindow: StopInfoWindow;
    private location: google.maps.LatLng;
    private marker: google.maps.Circle;
    private departures: Map<string, Array<departure>>;
    private direction: string;
}

export default Stop;