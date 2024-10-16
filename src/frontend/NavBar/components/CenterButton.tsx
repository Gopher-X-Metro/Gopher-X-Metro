import React, { useEffect, useState } from "react";
import { IoMdLocate } from "react-icons/io";
import { ControlPosition, MapControl, useMap } from "@vis.gl/react-google-maps";
import { centerMap } from "src/frontend/Pages/Map/Map";

export default function CenterButton() {
    const [centered, setCentered] = useState(true);
    const map = useMap("map");

    const onClick = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                if (position.coords.accuracy <= 1000) {
                    centerMap(map, {lat: position.coords.latitude, lng: position.coords.longitude}, 16); 
                    setCentered(true);
                } else
                    console.warn("Your location is too inaccurate to center.");
            }, () => console.warn("Unable to retreive your location."));
        }

        if (!centered) {
            centerMap(map); 
            setCentered(true);
        }
    }

    useEffect(() => {
        if (map) {
            map.addListener("center_changed", () => setCentered(false));
            map.addListener("zoom_changed", () => setCentered(false));
            map.addListener("drag", () => setCentered(false));
        }
    }, [map])

    return (
        <>
            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
                <button id="center-button" 
                        draggable="false"
                        aria-label="Center"
                        title="Center"
                        type="button"
                        className={"center-button" + (centered ? " centered" : "")} 
                        onClick={() => onClick()}>
                    <IoMdLocate className="icon"/>
                </button>
            </MapControl>
        </>
    )
}