import Primative from "./Primative";

/**
 * Builds Map Elements
 */
abstract class Element extends Primative {
    /* Public */

    /**
     * Element Constructor
     * @param id ID of the element
     * @param color color of the element
     * @param map map the element displays on 
     */
    constructor(id: string, map: google.maps.Map, marker: google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement) {
        super(id, map);
        this.marker = marker;
    }
    /**
     * Gets the marker object on the map
     */
    public getMarker() : google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement { return this.marker; }
    /**
     * Sets the visibility of the marker
     * @param visible if the marker should be visible
     */
    public setVisible(visible: boolean) : void {
        if (this.marker instanceof google.maps.MVCObject)
            this.marker.set("map", visible ? this.map : undefined);
        else if (this.marker instanceof google.maps.marker.AdvancedMarkerElement)
            this.marker.map = visible ? this.map : undefined;
    }
    /**
     * Tells if the marker is visible
     */
    public isVisible() : boolean {
        if (this.marker instanceof google.maps.MVCObject)
            return this.marker.get("map") !== undefined;
        else if (this.marker instanceof google.maps.marker.AdvancedMarkerElement)
            return this.marker.map !== undefined;
        return false;
    }

    /* Private */
    protected readonly marker: google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement;
}

export default Element;