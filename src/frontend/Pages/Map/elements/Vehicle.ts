import InfoWindowElement from "./abstracts/InfoWindowElement";
import Realtime from "../../../../backend/Realtime.ts";
import Schedule from "../../../../backend/Schedule.ts";

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
    public updateWindow() {
        this.infoWindow?.setContent(
            String(Math.ceil(Number(this.getLastUpdated())))
        );
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
    /**
     * Updates the info window information
     * @param busId the orientation of the greenline lightrail
     * @param routeId
     * @param schedule_number
     */
    public async updateBusWindow(busId: string, routeId: string, schedule_number: number) {
        const generateContent = (content: string, errorMessage?: string): string =>
            `<div style="text-align:center; font-family: Arial, sans-serif;">
                    <h2 style="margin-bottom: 10px; font-weight: bold; border-bottom: 2px solid #000;">${this.direction_id}</h2>
                    <p style="margin-bottom: 20px; font-size: 16px;">${busId}</p>
                    ${errorMessage ? `<p style="color: red;">${errorMessage}</p>` : `<ul style="margin-top: 20px; list-style: none;">${content}</ul>`}
                </div>`;
        try {
            let content;
            if (busId.length > 10) {
                const stopList = await Schedule.getStopList(routeId, schedule_number);
                content = await this.MTInfoWindowBody(busId, stopList);
            }
            else {
                content = await this.UMNInfoWindowBody(busId);
            }
            this.infoWindow?.setContent(generateContent(content));
        } catch (e) {
            console.error(`Failed to update info window:`, e);
            this.infoWindow?.setContent(generateContent("", "Failed to load departure information."));
        }
    }

    /**
     * Fills in Metro Transit bus info window
     * @param trip_id the orientation of the greenline lightrail
     * @param stop_list
     */
    public async MTInfoWindowBody(trip_id: string, stop_list: Array<any>): Promise<string> {
        let output = "";
        try {
            const feedMessage = await Realtime.getRealtimeGTFSTripUpdates();

            // Check if feedMessage is undefined or if entities are not present
            if (!feedMessage || !feedMessage.entity) {
                console.warn('No valid feed message received.');
                return output; // Exit early if there's no valid data
            }

            // Accessing the list of entities in the feed message
            const entities = feedMessage.entity;
            // console.log(entities);
            // Looping through each entity to access its properties
            for (const entity of entities) {
                const entityIdParts = entity.id.split('_');
                const tripID = entityIdParts[1];
                // console.log(entity);

                if (trip_id === tripID) {
                    // Ensure tripUpdate and stopTimeUpdate are not undefined or null
                    if (entity.tripUpdate && entity.tripUpdate.stopTimeUpdate && entity.tripUpdate.stopTimeUpdate.length > 0) {
                        const theStop = entity.tripUpdate.stopTimeUpdate[0].stopId;
                        // console.log(theStop);
                        let departureTime = entity.tripUpdate.stopTimeUpdate[0].departure?.time;

                        if (!departureTime) {
                            departureTime = entity.tripUpdate.stopTimeUpdate[1].departure?.time;
                        }
                        if (departureTime) {
                            const timeInSeconds = typeof departureTime === 'number' ? departureTime : departureTime.toNumber();
                            const arrival = this.getTime(timeInSeconds);

                            if (Array.isArray(stop_list)) {
                                console.log(stop_list);
                                console.log(theStop);
                                stop_list.forEach((nextStop, index) => {
                                    // console.log(nextStop);
                                    if (theStop == nextStop.stop_id) {
                                        const stopName = nextStop.stop_name;
                                        output += `<p>Bus ${tripID}<br> will arrive at ${arrival} at ${stopName}<p>`;
                                    }
                                    // Check if this is the last element
                                    else if (index === stop_list.length - 1 && theStop != nextStop.stop_id) {
                                        output += `<p>Bus ${tripID}<br> Bruh is not found mane: STOP: ${theStop}<p>`;
                                    }
                                });
                            } else {
                                console.warn('Expected an array but got:', stop_list);
                            }
                        } else {
                            console.log(tripID);
                            console.warn('Departure time is missing.');
                        }
                    } else {
                        console.warn('tripUpdate or stopTimeUpdate is missing or empty.');
                    }
                }
            }
        } catch (error) {
            console.error('Error processing trip updates:', error);
        }

        return output;
    }

    /**
    * Fills in peak transit bus info window
    * @param trip_id the orientation of the greenline lightrail
    */
    public async UMNInfoWindowBody(trip_id: string): Promise<string> {
        let output = "";
        try {
            const vehicles = await Realtime.getRealtimeGTFSUniversity();

            // if (vehicles) {
            const vehicleData = vehicles.vehicles;
            console.log(vehicles);
            vehicleData.forEach(vehicle => {
                if (vehicle.tripID === trip_id) {
                    output += `<p> This is the next stop: ${vehicle.nextStopID}`
                }
            })
            output += "<p> you idiot <p>";
            // } else {
            //     console.warn('No feed message received.');
            // }
        } catch (error) {
            console.error('Error processing trip updates:', error);
        }
        return output;
    }
    /**
    * Sets position of bus arrow image around center of bus image
    * @param arrival the orientation of the greenline lightrail
    */
    public getTime(arrival: number) {
        const date = new Date(arrival * 1000); // Convert seconds to milliseconds
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // The hour '0' should be '12'
        const strMinutes = minutes < 10 ? '0' + minutes : minutes;
        const strTime = `${hours}:${strMinutes} ${ampm}`;
        return strTime;
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