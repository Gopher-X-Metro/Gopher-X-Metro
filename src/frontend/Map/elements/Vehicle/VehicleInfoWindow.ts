import InfoWindowElement from "../InfoWindowElement";
import Vehicle from "./Vehicle";

class VehicleInfoWindow extends InfoWindowElement {
    constructor(element: google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement, map: google.maps.Map) {
        super(element, undefined, map);

        this.getWindow().set("pixelOffset", new google.maps.Size(0, -15));
    }

    /**
     * Updates the content of the info window with vehicle details
     * @param vehicle The vehicle object
     */
    public updateContent(vehicle: Vehicle) {
        const content = document.createElement('div');
        content.innerHTML = `
            <div>
                <p>Capacity: 40</p>
                <p>Last Updated: 5 seconds ago</p>
                <p>Next Stop: University Ave & 23rd Ave</p>
            </div>
        `;
        this.getWindow().setContent(content);
    }
}

export default VehicleInfoWindow;
