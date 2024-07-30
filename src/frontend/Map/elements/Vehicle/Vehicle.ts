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
        busContainer.style.transform = "translate(-50%, -50%)";

        // Create arrow container
        const arrowContainer = document.createElement("div");
        arrowContainer.style.position = "absolute";
        arrowContainer.style.transform = "translate(-50%, -50%)";

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

        // Store reference to arrow image and container
        this.arrowImg = arrowImage;
        this.arrowCont = arrowContainer;

        contents.appendChild(busContainer);
        contents.appendChild(arrowContainer);

        this.marker = new window.google.maps.marker.AdvancedMarkerElement({
            map: map,
            content: contents,
        })

        this.infoWindow = new VehicleInfoWindow(this.marker, map);
    }
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
            this.setArrowImageOrientation(bearing);
        }
    }
    /**
     * Sets if the vehicle is visible
     * @param visible the visibility of the vehicle
     */
    public setVisible(visible: boolean) {
        this.marker.map = visible ? this.map : null
    }

    /**
     * Sets position of bus arrow image around center of bus image
     * @param bearing the orientation of the bus
     */
    public setArrowImageOrientation(bearing: number) : void {
        if (this.arrowCont) {
            if (bearing > 0 && bearing < 45) {
                this.arrowCont.style.top = "-10px";
                this.arrowCont.style.left = "5px";
            } else if (bearing >= 45 && bearing < 90) {
                this.arrowCont.style.top = "-5px";
                this.arrowCont.style.left = "10px";
            } else if (bearing === 90) {
                this.arrowCont.style.left = "10px";
            } else if (bearing > 90 && bearing < 135) {
                this.arrowCont.style.top = "5px";
                this.arrowCont.style.left = "10px";
            } else if (bearing >= 135 && bearing < 180) {
                this.arrowCont.style.top = "10px";
                this.arrowCont.style.left = "5px";
            } else if (bearing === 180) {
                this.arrowCont.style.top = "10px";
            } else if (bearing > 180 && bearing < 225) {
                this.arrowCont.style.top = "10px";
                this.arrowCont.style.left = "-5px";
            } else if (bearing >= 225 && bearing < 270) {
                this.arrowCont.style.top = "5px";
                this.arrowCont.style.left = "-10px";
            } else if (bearing === 270) {
                this.arrowCont.style.left = "-10px";
            } else if (bearing > 270 && bearing < 315) {
                this.arrowCont.style.top = "-5px";
                this.arrowCont.style.left = "-10px";
            } else if (bearing >= 315 && bearing < 360) {
                this.arrowCont.style.top = "-10px";
                this.arrowCont.style.left = "-5px";
            } else {
                this.arrowCont.style.top = "-10px";
            }
        }
    }
    /**
     * Updates the info window information
     */
    public updateInfoWindow() {
        this.infoWindow.setContent(
            String(Math.round(Number(this.getLastUpdated())))
        );
    }
    
    /* Private */

    private tripId: string | undefined;
    private timestamp : number | undefined;
    private marker: google.maps.marker.AdvancedMarkerElement;
    private bearing: number | undefined;
    private arrowImg: HTMLImageElement | null = null;
    private arrowCont: HTMLDivElement;
    private infoWindow: VehicleInfoWindow;
}

export default Vehicle;