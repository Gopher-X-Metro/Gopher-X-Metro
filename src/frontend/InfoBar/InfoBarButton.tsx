import React from "react";
import Data from "src/data/Data";

export default function InfoBarButton( { text, setInfoPage, setInfo} ) {
    const onClick = async () => {
        await Data.Shape.all(text).then(shapes => setInfo(shapes));

        setInfoPage(true);
    }

    return (
        <button className="button" onClick={onClick}>
            <p>{text}</p>
        </button>
    )
}