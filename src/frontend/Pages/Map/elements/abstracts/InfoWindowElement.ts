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
    constructor(id: string, map: L.Map, marker: L.Marker | L.CircleMarker, offset?: [number, number]) {
        super(id, map, marker);

        this.infoWindow = new InfoWindow(marker.getLatLng(), map, offset);

        marker.on("click", () => {
            this.infoWindow.setPosition((this.marker as L.Marker | L.CircleMarker).getLatLng());
            this.infoWindow.setVisible(!this.infoWindow.isVisible());
            // Fill the window right away instead of waiting for the next refresh
            if (this.infoWindow.isVisible()) this.updateWindow();
        });
    }

    /**
     * Sets the visibility of the marker, closing its info window when it's hidden
     * @param visible if the marker should be visible
     */
    public setVisible(visible: boolean) : void {
        super.setVisible(visible);
        if (!visible) this.infoWindow?.setVisible(false);
    }
    /**
     * Updates the info window information
     */
    abstract updateWindow() : void;

    public readonly infoWindow: InfoWindow;
}

export default InfoWindowElement;
