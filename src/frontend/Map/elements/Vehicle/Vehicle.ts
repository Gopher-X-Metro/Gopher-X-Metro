import Element from "../Element.ts";
import VehicleInfoWindow from "./VehicleInfoWindow.ts";

class Vehicle extends Element {

    /* Public */

    /**
     * Vehicle Constructor
     * @param vehicleId vehicle ID
     * @param tripId 
     * @param color color of vehicle image
     * @param map map the vehicle displays on
     */
    constructor (vehicleId: string, color : string, map: google.maps.Map, images: string[2]) {
        super(vehicleId, color, map);

        const content = document.createElement("div");

        const busImage = document.createElement("img")
        busImage.src = images[0];
        busImage.width = 30;
        content.appendChild(busImage);

        const arrowImage = document.createElement("img")
        arrowImage.src = images[1];
        arrowImage.width = 10;
        content.appendChild(arrowImage);

        this.marker = new window.google.maps.marker.AdvancedMarkerElement({
            map: map,
            content: busImage,
        })

        this.infoWindow = new VehicleInfoWindow(this.marker, map);
        
        this.getInfoWindow().getWindow().set("pixelOffset", new google.maps.Size(0, -15));

        // Fetch initial data
        this.fetchVehicleData();
        this.fetchNextStop();

        // Add event listener to marker
        this.marker.addListener('click', () => {
            this.infoWindow.updateContent(this);
            this.infoWindow.getWindow().open(this.map, this.marker);
        });
    }   
    /**
     * Gets the info window object on the map
     */
    public getInfoWindow() : VehicleInfoWindow { return this.infoWindow; }
    /**
     * Gets the length in ms of the time between when position was updated and now
     */
    public getLastUpdated() : number | undefined {
        if (this.timestamp)
            return (Date.now()/1000) - this.timestamp; 
    }
    /**
     * Get the trip ID
     */
    public getTripId() : string | undefined { return this.tripId; }
    /**
     * Get the marker object of this vehicle on the map
     */
    public getMarker() : google.maps.marker.AdvancedMarkerElement { return this.marker; }
    /**
     * Sets the trip ID
     * @param tripId trip ID
     */
    public setTripId(tripId : string) : void { this.tripId = tripId; }
    /**
     * Sets the position of the vehicle on the map
     * @param position position of the vehicle
     * @param timestamp when this position was updated
     */
    public setPosition(position : google.maps.LatLng, timestamp : number) : void {
        if (!(this.getMarker().position?.toString() === position.toString())) {
            this.infoWindow.setPosition(position);
            this.getMarker().position = position;
            this.timestamp = timestamp;
        }
    }
    /**
     * Gets the direction the bus is heading
     */
    public getBusBearing(): number | undefined { return this.bearing; }
    /**
     * Sets the direction the bus is heading
     * @param bearing the orientation of the bus
     */
    public setBusBearing(bearing: number): void {
        this.bearing = bearing;
    }
    /**
     * Sets if the vehicle is visible
     * @param visible the visibility of the vehicle
     */
    public setVisible(visible: boolean) {
        this.marker.map = visible ? this.map : null
    }
    
    /* Private */

    private tripId: string | undefined;
    private timestamp : number | undefined;
    private marker: google.maps.marker.AdvancedMarkerElement;
    private bearing: number | undefined;
    private infoWindow: VehicleInfoWindow;
    private capacity: number; // Add this property
    private nextStop: string; // Add this property

    private async fetchVehicleData() {
        try {
            const response = await fetch(`https://api.metrotransit.org/nextrip/vehicles?vehicleId=${this.vehicleId}`);
            const data = await response.json();
            this.capacity = data.capacity || "N/A"; // Assuming API returns capacity
            this.timestamp = data.timestamp; // Assuming API returns timestamp
        } catch (error) {
            console.error('Error fetching vehicle data:', error);
        }
    }

    private async fetchNextStop() {
        try {
            const response = await fetch(`https://api.metrotransit.org/nextrip/predictions/${this.vehicleId}`);
            const data = await response.json();
            this.nextStop = data.nextStop || "N/A"; // Assuming API returns next stop
        } catch (error) {
            console.error('Error fetching next stop:', error);
        }
    }

    public getCapacity(): number {
        return this.capacity;
    }

    public getNextStop(): string {
        return this.nextStop;
    }

}

export default Vehicle;