import L from "leaflet";

export default class InfoWindow {
    /* Public */

    /**
     * InfoWindow Constructor
     * @param location  location of the InfoWindow
     * @param map       map the InfoWindow displays on
     * @param offset    pixel offset of the InfoWindow from its location
     */
    constructor(location: L.LatLng | undefined, map: L.Map, offset: [number, number] = [0, 0]) {
        this.map = map;
        this.window = L.popup({ offset: offset, autoPanPaddingTopLeft: [20, 90] });

        if (location) this.window.setLatLng(location);
    }   
    /**
     * Changes the content of the info window on the map
     */
    public setContent(content: string | HTMLElement) {
        this.window.setContent(content);
    }
    /**
     * Sets the visibility of the info window
     */
    public setVisible(visible: boolean) : void {
        if (visible)
            this.window.openOn(this.map);
        else
            this.map.closePopup(this.window);
    }
    /**
     * If the info window is displaying on the map
     */ 
    public isVisible() : boolean { return this.window.isOpen(); }
    /**
     * Gets the info window object on the map
     */
    public getWindow() : L.Popup { return this.window; }
    /**
     * Sets the position of the info window on the map
     */
    public setPosition(location: L.LatLng) { this.window.setLatLng(location); }

    /* Private */

    protected window: L.Popup;
    protected map: L.Map;
}
