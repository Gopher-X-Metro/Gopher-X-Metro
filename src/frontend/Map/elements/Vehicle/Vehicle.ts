import Element from "../Element.ts";
import VehicleInfoWindow from "./VehicleInfoWindow.ts";

import Resources from "../../../../backend/Resources.ts";
import Schedule from "../../../../backend/Schedule.ts";
import Static from "../../../../backend/Static.ts";
// import Vehicle from "./elements/Vehicle/Vehicle.ts";

import URL from "../../../../backend/URL.ts";
import Route from "../../elements/Route.ts";
import Realtime from "../../../../backend/Realtime.ts";
import Plan from "../../../../backend/Plan.ts";
import Stop from "../../elements/Stop/Stop.ts";

class Vehicle extends Element {

    /* Public */

    /**
     * Vehicle Constructor
     * @param vehicleId vehicle ID
     * @param tripId 
     * @param color color of vehicle image
     * @param map map the vehicle displays on
     */
    constructor (vehicleId: string, color : string, images: string[2], map: google.maps.Map) {
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
     * Gets the direction the lightrail is heading
     */
    public getDirectionID(): number | undefined { return this.direction_id; }

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
     */
    public async updateInfoWindow(busId: string, routeId: string, schedule_number: number) {
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
            this.infoWindow.setContent(generateContent(content));
        } catch (e) {
            console.error(`Failed to update info window:`, e);
            this.infoWindow.setContent(generateContent("", "Failed to load departure information."));
        }
    }


    public async MTInfoWindowBody(trip_id : string, stop_list: Array<any>) : Promise<string> {
        let output = "";
        try {
            const feedMessage = await Realtime.getRealtimeGTFSTripUpdates();
            
            // if (feedMessage) {
                // Accessing the list of entities in the feed message
                const entities = feedMessage.entity;
                
                // Looping through each entity to access its properties
                entities.forEach(async entity => {
                    const entityIdParts = entity.id.split('_');
                    const tripID = entityIdParts[1];
                    
                    if (trip_id == tripID) {
                        if (entity.tripUpdate) {
                            let arrival = this.getTime(entity.tripUpdate.stopTimeUpdate[0].departure.time);
                            // let direction_id = entity.tripUpdate.trip.direction_id;
                            // let route_id = entity.tripUpdate.trip.route_id;
                            let stopName;

                            // const stopList = await Schedule.getStopList(route_id, direction_id);

                            if (Array.isArray(stop_list)) {
                                stop_list.forEach(nextStop => {
                                    if (entity.tripUpdate.stopTimeUpdate[0].stopId === nextStop.stop_id) {
                                        stopName = nextStop.stop_name;
                                    }
                                });
                                output += `<p>The Trip_ID is: ${tripID}<br>It will arrive at ${arrival} at ${stopName}<p>`;
                            } else {
                                console.warn('Expected an array but got:', stop_list);
                            }
                        }
                    // } else {
                    //     console.warn('No feed message received.');
                    // }
                    }
                });
        } catch (error) {
            console.error('Error processing trip updates:', error);
        }
        return output;
    }


    public async UMNInfoWindowBody(trip_id : string) : Promise<string> {
        let output = "";
        try {
            const vehicles = await Realtime.getRealtimeGTFSUniversity();
            
            // if (vehicles) {
                const vehicleData = vehicles.vehicles;

                vehicleData.forEach(vehicle => {
                    if (vehicle.tripID === trip_id) {
                        output += `<p> This is the next stop: ${vehicle.nextStopID}`
                    }
                })
                output += "<p> you idiot <p>";
                // Accessing the list of entities in the feed message

            // } else {
            //     console.warn('No feed message received.');
            // }
        } catch (error) {
            console.error('Error processing trip updates:', error);
        }
        return output;
    }
    
    public getTime(arrival : number) {
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

    private tripId: string | undefined;
    private timestamp : number | undefined;
    private marker: google.maps.marker.AdvancedMarkerElement;
    private bearing: number | undefined;
    private direction_id: number | undefined;
    private arrowImg: HTMLImageElement | null = null;
    private arrowCont: HTMLDivElement;
    private infoWindow: VehicleInfoWindow;


}

export default Vehicle;