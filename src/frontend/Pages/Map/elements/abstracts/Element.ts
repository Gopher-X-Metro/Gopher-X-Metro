import L from "leaflet";
import Primative from "./Primative";

/**
 * Builds Map Elements
 */
abstract class Element extends Primative {
    /* Public */

    /**
     * Element Constructor
     * @param id ID of the element
     * @param map map the element displays on 
     * @param marker layer that represents the element
     */
    constructor(id: string, map: L.Map, marker: L.Layer) {
        super(id, map);
        this.marker = marker;
    }
    /**
     * Gets the marker object on the map
     */
    public getMarker() : L.Layer { return this.marker; }
    /**
     * Sets the visibility of the marker
     * @param visible if the marker should be visible
     */
    public setVisible(visible: boolean) : void {
        if (visible)
            this.marker.addTo(this.map);
        else
            this.marker.remove();
    }
    /**
     * Tells if the marker is visible
     */
    public isVisible() : boolean { return this.map.hasLayer(this.marker); }

    /* Private */
    protected readonly marker: L.Layer;
}

export default Element;
