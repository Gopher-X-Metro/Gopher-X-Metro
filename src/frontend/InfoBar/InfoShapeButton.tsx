import React from "react";
import Data from "src/data/Data";

type InfoShapeButtonProps = {
    shape : Data.Shape
}

export default function InfoShapeButton( { shape } : InfoShapeButtonProps ) {
    const onClick = async () => {
        console.log(shape);
    }

    return (
        <button className="button" onClick={onClick}>
            <p>{shape.id as string}</p>
        </button>
    )
}