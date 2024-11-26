import { ControlPosition, MapControl, useMap } from "@vis.gl/react-google-maps";
import { useState } from "react";

export default function POIButton() {
    const [POIVisible, setPOI] = useState(false);
    const map = useMap("map");

    const onClick = () => {
        setPOI(prevPOIVisible => {
            const newPOIVisible = !prevPOIVisible;
            if (map) {
                const mapStyles = map.get("styles") || [];
                if (newPOIVisible) {
                    // Remove POI hiding styles
                    const newStyles = mapStyles.filter(style => style.featureType !== "poi");
                    map.setOptions({ styles: newStyles });
                } else {
                    // Add POI hiding styles
                    const newStyles = [
                        ...mapStyles,
                        {
                            featureType: "poi",
                            stylers: [{ visibility: "off" }]
                        }
                    ];
                    map.setOptions({ styles: newStyles });
                }
            }
            return newPOIVisible;
        });
    };

    return (
        <MapControl position={ControlPosition.RIGHT_BOTTOM}>
            <button id="poi-button" draggable="false" onClick={onClick}>
                Toggle POI
            </button>
        </MapControl>
    );
}