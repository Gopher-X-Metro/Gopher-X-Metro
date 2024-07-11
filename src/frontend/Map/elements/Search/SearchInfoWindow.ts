import InfoWindowElement from "../InfoWindowElement";

class SearchInfoWindow extends InfoWindowElement {
    /**
     * Constructor for SearchInfoWindow
     * @param location  Location of the infoWindow
     * @param map       Map the infowWindow is put on
     */
    constructor(element: google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement, location: google.maps.LatLng, map: google.maps.Map) {
        super(element, location, map);

        this.getWindow().set("pixelOffset", new google.maps.Size(0, -15));
    }
}

export default SearchInfoWindow;