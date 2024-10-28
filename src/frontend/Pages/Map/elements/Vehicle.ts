import Data from "src/data/Data";
import InfoWindowElement from "./abstracts/InfoWindowElement";
import Resources from "src/backend/Resources";

class Vehicle extends InfoWindowElement {
    /* Public */

    /**
     * Vehicle Constructor
     * @param vehicleId vehicle ID
     * @param tripId 
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
     * Updates the info window information
     */
    public async updateWindow(routeId: string) {
        /**
         * Generate the content of the infowindow
         * @param errorMessage  the error message to replace the content
         */
        const generateContent = async () => {
            const vehicle = await Data.Vehicle.get(routeId, this.id);

            const divElement = document.createElement("div");
            divElement.style.cssText = "text-align:center; font-family: Arial, sans-serif;";

            const directionElement = document.createElement("h2");
            directionElement.textContent = vehicle.direction
            directionElement.style.cssText = "margin-bottom: 10px; font-weight: bold; border-bottom: 2px solid #000;";

            divElement.appendChild(directionElement);
            
            const departures = 
                (await Data.Departure.all(routeId, vehicle.directionId))
                .filter(departure => (departure.id === this.id && departure.data.actual))
                .sort((a, b) => a.data.departure_time - b.data.departure_time)
                .slice(0, 2);

            // console.log(departures);

            const listElement = document.createElement("ul")
            listElement.style.cssText = "margin-top: 20px; list-style: none;";

            const listItemElement = document.createElement("li");
            listItemElement.style.cssText = "display: inline-block; margin-left: 10px; margin-right: 10px; vertical-align: text-top;";

            const svgElement = document.createElement("p");
            svgElement.innerHTML = `<svg width="12" height="12" style="display: block; margin: 0 auto 5px;"><circle cx="6" cy="6" r="6" fill="#${await Resources.getColor(routeId)}"/></svg>`

            const routeIdElement = document.createElement("h3");
            routeIdElement.innerHTML = `- ${routeId} -`;
            routeIdElement.style.cssText = "margin-top: 10px;";
            
            listItemElement.appendChild(svgElement);
            listItemElement.appendChild(routeIdElement);

            departures.forEach(async departure => {
                const stop = await Data.Stop.get(routeId, vehicle.directionId, departure.placeId, departure.data.stop_id);
                const timeElement = document.createElement("p");
                timeElement.innerHTML = stop.description + " : " + departure.data.departure_text;
                timeElement.style.cssText = "margin: 5px 0; font-size: 14px;";
                
                listItemElement.appendChild(timeElement);
            })

            listElement.append(listItemElement);
            
            divElement.appendChild(listElement);
        

            return divElement;
        }

        // Load infowindow
        this.infoWindow?.setContent(await generateContent());
    }
    /**
     * Gets the length in ms of the time between when position was updated and now
     */
    public getLastUpdated() : number | undefined {
        if (this.positionTimestamp)
            return (Date.now()/1000) - this.positionTimestamp; 
    }
    /**
     * Get the trip ID
     */
    public getTripId() : string | undefined { return this.tripId; }
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
        if (!((this.marker as google.maps.marker.AdvancedMarkerElement).position?.toString() === position.toString())) {
            this.infoWindow?.setPosition(position);
            (this.marker as google.maps.marker.AdvancedMarkerElement).position = position;
            this.positionTimestamp = timestamp;
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
     * Gets the direction the lightrail is heading
     */
    public getDirectionID(): number | undefined { return this.direction_id; }
    /**
     * Returns if the vehicle position has been updated
     */
    public isPositionUpdated(): boolean { return this.getLastUpdated() as number < 300 }
    /**
     * Sets the updated status of the vehicle
     * @param bool the new updated status
     */
    public updateTimestamp() : void { this.updatedTimestamp = Date.now(); }
    /**
     * Returns if the vehicle had been updated
     */
    public isUpdated(): boolean { return (this.updatedTimestamp && this.isPositionUpdated()) ? (Date.now() - this.updatedTimestamp < 500) : false; }
    /**
     * Sets the direction the blueline lightrail is heading
     * @param direction_id the orientation of the blueline lightrail
     */
    public setBlueDirectionID(direction_id: number): void {
        this.direction_id = direction_id;
        if (this.arrowImg) {
            this.setArrowImageBluelineOrientation(direction_id);
        }
    }
    /**
     * Sets the direction the greenline lightrail is heading
     * @param direction_id the orientation of the greenline lightrail
     */
    public setGreenDirectionID(direction_id: number): void {
        this.direction_id = direction_id;
        if (this.arrowImg) {
            this.setArrowImageGreenlineOrientation(direction_id);
        }
    }
    /**
     * Sets position of bus arrow image around center of bus image
     * @param bearing the orientation of the bus
     */
    public setArrowImageOrientation(bearing: number) : void {
        const radius = 10;
        const radians = (bearing + 90) / 180 * Math.PI;
        
        if (this.arrowCont) {
            this.arrowCont.style.top = (-Math.sin(radians) * radius).toString() + "px";
            this.arrowCont.style.left = (-Math.cos(radians) * radius).toString() + "px";
        }
    }
    /**
     * Sets position of bus arrow image around center of bus image
     * @param direction_id the orientation of the blueline lightrail
     */
    public setArrowImageBluelineOrientation(direction_id: number) : void {
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
    /**
     * Sets position of bus arrow image around center of bus image
     * @param direction_id the orientation of the greenline lightrail
     */
    public setArrowImageGreenlineOrientation(direction_id: number) : void {
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
    
    /* Private */
    private updatedTimestamp: number | undefined;
    private tripId: string | undefined;
    private positionTimestamp : number | undefined;
    private bearing: number | undefined;
    private direction_id: number | undefined;
    private arrowImg: HTMLImageElement | null = null;
    private arrowCont: HTMLDivElement;
}

export default Vehicle;