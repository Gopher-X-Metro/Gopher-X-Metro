import React, { useEffect, useState } from "react";
import { MdFilterCenterFocus } from "react-icons/md";
import { ControlPosition, MapControl, useMap } from "@vis.gl/react-google-maps";
import { centerMap } from "src/frontend/Pages/Map/Map";

export default function CenterButton() {
    const [centered, setCentered] = useState(true);
    const map = useMap("map");


    useEffect(() => {
        if (map) {
            map.addListener("center_changed", () => setCentered(false));
            map.addListener("zoom_changed", () => setCentered(false));
        }
    }, [map])

    return (
        <>
            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
                <button id="center-button" className={"center-button" + (centered ? " centered" : "")} onClick={() => {centerMap(map); setCentered(true)}}>
                    <MdFilterCenterFocus className="icon"/>
                </button>
            </MapControl>
        </>
    )
}