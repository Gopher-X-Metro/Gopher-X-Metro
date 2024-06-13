//import Resources from "../../backend/Resources.ts";

export default class InfoWindow{
    /* Public */

    /**
     * InfoWindow Constructor
     * @param routeId route ID the InfoWindow belongs to
     * @param color color of the InfoWindow
     * @param location location of the InfoWindow
     * @param map map the InfoWindow displays on
     */
    constructor(routeId: string, location: google.maps.LatLng, map: google.maps.Map) {
        this.routeId = routeId;
        this.location = location
        //const stopTimes = new Map<string, string | undefined>();
        //const Circle_color = Resources.getColor(this.routeId);
        const contentString = "Route ID: " + this.routeId;
        
        this.infoWindow = new window.google.maps.InfoWindow({
            ariaLabel: contentString,
            content: contentString,
            maxWidth: 200, // Set the maximum width of the info window
            //maxHeight: 200, // Set the maximum height of the info window
        });
        this.infoWindow.setContent("Route ID: " + this.routeId);
        this.infoWindow.setPosition(location);
    }   
    
    /**
     * Changes the content of the info window on the map
     */
    public setContent(content: string) {
        this.infoWindow.setContent(content);
    }
    /**
     * Closes the info window on the map
     */
    public closeWindow() {
        if (this.infoWindow) this.infoWindow.close();
    } 
    /**
     * Gets the info window object on the map
     */
    public getWindow() : google.maps.InfoWindow { return this.infoWindow; }

    /* Private */

    private routeId: string;
    private location: google.maps.LatLng;
    private infoWindow: google.maps.InfoWindow;
}