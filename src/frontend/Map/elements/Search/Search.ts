import Element from "../Element";
import SearchInfoWindow from "./SearchInfoWindow";

class Search extends Element {
    /* Public */
    constructor(searchId: string, location: google.maps.LatLng, map: google.maps.Map) {
        super(searchId, "", map);

        this.marker = new google.maps.marker.AdvancedMarkerElement({
            map: map,
            content: new window.google.maps.marker.PinElement({scale: 0.8}).element,
            position: location
        });
        
        this.infoWindow = new SearchInfoWindow(this.marker, location, map);

        this.updateInfoWindow();
    }

    /**
     * Updates the info window information
     */
    public async updateInfoWindow() : Promise<void> {
        this.infoWindow.setContent(`<div><button style="width: 100px; height: 100px;">Close</button></div>`)
    }

    /* Private */
    private marker: google.maps.marker.AdvancedMarkerElement;
    private infoWindow: SearchInfoWindow;
}

export default Search;