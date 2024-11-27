import React, { useEffect, useState } from "react";
import { IoMdLocate } from "react-icons/io";
import { ControlPosition, MapControl, useMap } from "@vis.gl/react-google-maps";
import { centerMap } from "src/frontend/Pages/Map/Map";

/**
 * CenterButton Component
 * 
 * Button to center map to user's current location or default center.
 * Button listens for map events such as 'center_changed', 'zoom_changed', and 'drag'
 * to update 'centered' state. This state determines whether the map is centered on 
 * the user's current location or not
 * 
 * @returns rendered CenterButton component
 */
export default function CenterButton() {
    const [centered, setCentered] = useState(true);
    const map = useMap("map");

    // Handles click event to center map
    const onClick = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                if (position.coords.accuracy <= 1000) {
                    centerMap(map, {lat: position.coords.latitude, lng: position.coords.longitude}, 16); 
                    setCentered(true);
                } else { 
                    console.warn("Your location is too inaccurate to center.") 
                };
            }, () => { console.warn("Unable to retreive your location.") });
        }

        // Re-center to default map position if not already centered
        if (!centered) {
            centerMap(map); 
            setCentered(true);
        }
    }

    // Adds listeners to map for certain events to set the 'centered' state to false
    useEffect(() => {
        if (map) {
            map.addListener("center_changed", () => setCentered(false));
            map.addListener("zoom_changed", () => setCentered(false));
            map.addListener("drag", () => setCentered(false));
        }
    }, [map]);

    return (
        <>
            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
                <button id="center-button" 
                        draggable="false"
                        aria-label="Center"
                        title="Center"
                        type="button"
                        className={"map-control-button center-button" + (centered ? " centered" : "")} 
                        onClick={() => onClick()}>
                    <IoMdLocate className="icon"/>
                </button>
            </MapControl>
        </>
    );
}