import React, { useEffect, useState } from "react";
import { IoMdLocate } from "react-icons/io";
import { ControlPosition, MapControl, useMap } from "@vis.gl/react-google-maps";




export default function POIButton() {
    const [POIVisible, setPOI] = useState(false);
    const inputPOI= document.getElementById("POI_input");
    const map = useMap("map");

    const onClick = () => {
        setPOI(!POIVisible);
        
    }

    return (
        <>
            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
                <button id="poi-button" 
                        draggable="false"
                        aria-label="POI"
                        title="POI"
                        type="button"
                        className={"poi-button" + (POIVisible ? " poi-visible" : "")} 
                        onClick={() => onClick()}>
                    <IoMdLocate className="icon"/>
                </button>
            </MapControl>
        </>
    );
}