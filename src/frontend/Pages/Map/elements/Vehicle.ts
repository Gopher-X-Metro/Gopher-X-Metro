import InfoWindowElement from "src/frontend/Pages/Map/elements/abstracts/InfoWindowElement";

class Vehicle extends InfoWindowElement {
    private updatedTimestamp: number | undefined;
    private tripId: string | undefined;
    private positionTimestamp : number | undefined;
    private bearing: number | undefined;
    private direction_id: number | undefined;
    private arrowImg: HTMLImageElement | null = null;
    private arrowCont: HTMLDivElement;

    /**
     * Vehicle Constructor
     * @param vehicleId vehicle ID
     * @param tripId trip ID
     * @param color color of vehicle image
     * @param map map the vehicle displays on
     */
    constructor (vehicleId: string, images: string[2], map: google.maps.Map) {
        const contents = document.createElement("div");
        contents.style.position = "relative";

        super(vehicleId, map, new window.google.maps.marker.AdvancedMarkerElement({
            map: map,
            content: contents,
        }));

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

        this.infoWindow?.getWindow().set("pixelOffset", new google.maps.Size(0, -15));
    }

    /**
     * Updates info window information
     */
    public updateWindow() : void {
        this.infoWindow?.setContent(
            String(Math.ceil(Number(this.getLastUpdated())))
        );
    }

    /**
     * Sets trip ID
     * @param tripId trip ID
     */
    public setTripId(tripId : string) : void { 
        this.tripId = tripId; 
    }

    /**
     * Sets position of vehicle on the map
     * @param position position of vehicle
     * @param timestamp when this position was updated
     */
    public setPosition(position : google.maps.LatLng, timestamp : number) : void {
        if (!((this.marker as google.maps.marker.AdvancedMarkerElement).position?.toString() === position.toString())) {
            this.infoWindow?.setPosition(position);
            (this.marker as google.maps.marker.AdvancedMarkerElement).position = position;
            this.positionTimestamp = timestamp;
        }
    }

    /**
     * Sets direction the bus is heading
     * @param bearing orientation of the bus
     */
    public setBusBearing(bearing: number): void {
        this.bearing = bearing;
        if (this.arrowImg) {
            this.arrowImg.style.transform = `rotate(${bearing}deg)`;
            this.setArrowImageOrientation(bearing);
        }
    }

    /**
     * Returns if vehicle position has been updated
     * @returns boolean if position has been updated
     */
    public isPositionUpdated(): boolean { 
        return this.getLastUpdated() as number < 300;
    }

    /**
     * Sets updated status of vehicle
     * @param bool new updated status
     */
    public updateTimestamp() : void { 
        this.updatedTimestamp = Date.now(); 
    }

    /**
     * Returns if vehicle has been updated
     * @returns boolean if vehicle has been updated
     */
    public isUpdated(): boolean { 
        return (this.updatedTimestamp && this.isPositionUpdated()) ? (Date.now() - this.updatedTimestamp < 500) : false; 
    }

    /**
     * Sets direction the blueline lightrail is heading
     * @param direction_id orientation of the blueline lightrail
     */
    public setBlueDirectionID(direction_id: number): void {
        this.direction_id = direction_id;
        if (this.arrowImg) {
            this.setArrowImageBluelineOrientation(direction_id);
        }
    }

    /**
     * Sets direction the greenline lightrail is heading
     * @param direction_id orientation of the greenline lightrail
     */
    public setGreenDirectionID(direction_id: number): void {
        this.direction_id = direction_id;
        if (this.arrowImg) {
            this.setArrowImageGreenlineOrientation(direction_id);
        }
    }
    
    /* Private Helper Methods */

    /**
     * Gets length in ms of time between when position was updated and now
     */
    private getLastUpdated() : number | undefined {
        if (this.positionTimestamp) {
            return (Date.now()/1000) - this.positionTimestamp;
        }
    }

    /**
     * Sets position of bus arrow image around center of bus image
     * @param bearing orientation of the bus
     */
    private setArrowImageOrientation(bearing: number) : void {
        const radius = 10;
        const radians = (bearing + 90) / 180 * Math.PI;
        
        if (this.arrowCont) {
            this.arrowCont.style.top = (-Math.sin(radians) * radius).toString() + "px";
            this.arrowCont.style.left = (-Math.cos(radians) * radius).toString() + "px";
        }
    }

    /**
     * Sets position of bus arrow image around center of bus image
     * @param direction_id orientation of the greenline lightrail
     */
    private setArrowImageGreenlineOrientation(direction_id: number) : void {
        if (this.arrowCont && this.arrowImg) {
            if (direction_id === 0) {
                this.arrowImg.style.transform = `rotate(${90}deg)`;
                this.arrowCont.style.left = "10px";
            } else if (direction_id === 1) {
                this.arrowImg.style.transform = `rotate(${270}deg)`;
                this.arrowCont.style.left = "-10px";
            }
        }
    }

    /**
     * Sets position of bus arrow image around center of bus image
     * @param direction_id orientation of the blueline lightrail
     */
    private setArrowImageBluelineOrientation(direction_id: number) : void {
        if (this.arrowCont && this.arrowImg) {
            if (direction_id === 0) {
                this.arrowImg.style.transform = `rotate(${0}deg)`;
                this.arrowCont.style.top = "-10px";
            } else if (direction_id === 1) {
                this.arrowImg.style.transform = `rotate(${180}deg)`;
                this.arrowCont.style.top = "10px";
            }
        }
    }

    /* Depreciated / Unused */

    /**
     * Get trip ID
     * @returns string trip ID
     */
    public getTripId() : string | undefined { 
        return this.tripId; 
    }

    /**
     * Gets direction the bus is heading
     * @returns direction number bus is heading
     */
    public getBusBearing(): number | undefined { 
        return this.bearing; 
    }

    /**
     * Gets direction the lightrail is heading
     * @returns direction ID number
     */
    public getDirectionID(): number | undefined { 
        return this.direction_id; 
    }
}

export default Vehicle;