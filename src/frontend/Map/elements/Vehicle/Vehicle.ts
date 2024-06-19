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

        const contents = document.createElement("div");
        contents.style.position = "relative";

        // Create bus container
        const busContainer = document.createElement("div");
        busContainer.style.position = "absolute";
        busContainer.style.left = "50%";
        busContainer.style.top = "50%";
        busContainer.style.transform = "translate(-50%, -50%)";

        // Create arrow container
        const arrowContainer = document.createElement("div");
        arrowContainer.style.position = "absolute";
        arrowContainer.style.left = "50%";
        arrowContainer.style.top = "50%";
        arrowContainer.style.transform = "translate(-50%, -50%)";
        arrowContainer.style.top = "-10px";

        // Create bus image
        const busImage = document.createElement("img")
        busImage.src = images[0];
        busImage.width = 25;
        busContainer.appendChild(busImage);

        // Create arrow image
        const arrowImage = document.createElement("img")
        arrowImage.src = images[1];
        arrowImage.width = 40;
        arrowContainer.appendChild(arrowImage);

        // Store reference to arrow image
        this.arrowImg = arrowImage;

        contents.appendChild(busContainer);
        contents.appendChild(arrowContainer);

        this.marker = new window.google.maps.marker.AdvancedMarkerElement({
            map: map,
            content: contents,
        })

        this.infoWindow = new VehicleInfoWindow(this.marker, map);

        this.marker.addListener("click", () => {
            if (this.infoWindow.isOpen())
                this.infoWindow.close();
            else
                this.infoWindow.open();
        })
    

        this.infoWindow = new VehicleInfoWindow(this.marker, map);
        
        this.getInfoWindow().getWindow().set("pixelOffset", new google.maps.Size(0, -15));
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
        if (this.arrowImg) {
            this.arrowImg.style.transform = `rotate(${bearing}deg)`;
        }
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
    private arrowImg: HTMLImageElement | null = null;
    private infoWindow: VehicleInfoWindow;
}

export default Vehicle;