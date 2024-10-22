import Element from "./Element";
import InfoWindow from "./InfoWindow";

abstract class InfoWindowElement extends Element {

    /**
     * Constructor for the InfoElement class
     * @param id        ID of the element
     * @param map       map the element appears on
     * @param marker    marker the element represents
     */
    constructor(id: string, map: google.maps.Map, marker: google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement) {
        super(id, map, marker);

        if (this.marker instanceof google.maps.MVCObject)
            this.infoWindow = new InfoWindow(this.marker.get("center"), map);
        else if (this.marker instanceof google.maps.marker.AdvancedMarkerElement)
            this.infoWindow = new InfoWindow(this.marker.position as google.maps.LatLng, map);

        this.marker.addListener("click", () => this.infoWindow?.setVisible(!this.infoWindow?.isVisible()));
    }

    /**
     * Updates the info window information
     */
    abstract updateWindow() : void;

    public readonly infoWindow: InfoWindow | undefined;

    /* Depreciated / Unused */

    /**
     * Updates the info window information
     * @deprecated
     */
    public updateInfoWindow() { this.updateWindow(); }
}

export default InfoWindowElement;