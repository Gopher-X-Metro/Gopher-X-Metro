import React from "react";
import Data from "src/data/Data";

type InfoRouteButtonProps = {
    routeId: string;
    setInfoPage: React.Dispatch<React.SetStateAction<boolean>>;
    setInfo: React.Dispatch<React.SetStateAction<Array<Data.Shape>>>;
}

export default function InfoRouteButton( { routeId, setInfoPage, setInfo } : InfoRouteButtonProps ) {
    const onClick = async () => {
        await Data.Shape.all(routeId).then(shapes => setInfo(shapes));

        setInfoPage(true);
    }

    return (
        <button className="button" onClick={onClick}>
            <p>{routeId}</p>
        </button>
    )
}