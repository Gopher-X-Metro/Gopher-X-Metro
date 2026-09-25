import L from "leaflet";
import Element from "./Element";
import InfoWindow from "./InfoWindow";

abstract class InfoWindowElement extends Element {

    /**
     * Constructor for the InfoElement class
     * @param id        ID of the element
     * @param map       map the element appears on
     * @param marker    marker the element represents
     * @param offset    pixel offset of the info window from the marker
     */
    constructor(id: string, map: L.Map, marker: L.Marker | L.Circle, offset?: [number, number]) {
        super(id, map, marker);

        this.infoWindow = new InfoWindow(marker.getLatLng(), map, offset);

        marker.on("click", () => {
            this.infoWindow.setPosition((this.marker as L.Marker | L.Circle).getLatLng());
            this.infoWindow.setVisible(!this.infoWindow.isVisible());
        });
    }

    /**
     * Updates the info window information
     */
    abstract updateWindow() : void;

    public readonly infoWindow: InfoWindow;
}

export default InfoWindowElement;
