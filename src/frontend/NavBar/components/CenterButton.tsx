import React from "react";
import { MdFilterCenterFocus } from "react-icons/md";
import { ControlPosition, MapControl, useMap } from "@vis.gl/react-google-maps";
import { centerMap } from "src/frontend/Pages/Map/Map";

export default function CenterButton() {
    const map = useMap("map");

    return (
        <>
            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
                <button id="center-button" className="center-button" onClick={() => centerMap(map)}>
                    <MdFilterCenterFocus className="icon"/>
                </button>
            </MapControl>
        </>
    )
}