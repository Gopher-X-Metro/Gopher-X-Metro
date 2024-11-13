import React from "react";
import Data from "src/data/Data";

export default function InfoBarButton( { text, setInfoPage, setInfo} ) {
    const onClick = async () => {
        await Data.Vehicle.all(text).then(vehicles => setInfo(vehicles));
        setInfoPage(true);
    }

    return (
        <button className="button" onClick={onClick}>
            <p>{text}</p>
        </button>
    )
}