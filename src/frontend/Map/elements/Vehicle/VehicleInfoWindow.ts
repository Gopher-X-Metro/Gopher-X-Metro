import InfoWindowElement from "../InfoWindowElement";

class VehicleInfoWindow extends InfoWindowElement {
    /**
     * Constructor for VehicleInfoWindow
     * @param routeId   ID of the route
     * @param map       Map the infowWindow is put on
     */
    constructor(element: google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement, map: google.maps.Map) {
        super(element, undefined, map);

        this.getWindow().set("pixelOffset", new google.maps.Size(0, -15));

        public updateContent(vehicle: Vehicle) {
            const content = document.createElement('div');
            content.innerHTML = `
                <div>
                    <p>Capacity: ${vehicle.getCapacity()}</p>
                    <p>Last Updated: ${vehicle.getLastUpdated()} seconds ago</p>
                    <p>Next Stop: ${vehicle.getNextStop()}</p>
                </div>
            `;
            this.getWindow().setContent(content);
        }
    }
}

export default VehicleInfoWindow;