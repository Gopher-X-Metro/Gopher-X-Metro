import React, { useEffect, useState } from "react";
import L from "leaflet";
import { IoMdLocate } from "react-icons/io";
import { centerMap } from "src/frontend/Pages/Map/Map";

export default function CenterButton({ map }: { map: L.Map | null }) {
    const [centered, setCentered] = useState(true);

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

        if (!centered) {
            centerMap(map);
            setCentered(true);
        }
    }

    useEffect(() => {
        if (map) map.on("dragstart zoomstart", () => setCentered(false));
    }, [map])

    return (
        <div className="absolute right-0 bottom-[80px] z-[1000]">
            <button id="center-button"
                    draggable="false"
                    aria-label="Center"
                    title="Center"
                    type="button"
                    className={"center-button" + (centered ? " centered" : "")}
                    onClick={() => onClick()}>
                <span className="icon"><IoMdLocate size="100%"/></span>
            </button>
        </div>
    )
}
