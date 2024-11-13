import React from "react";

export default function InfoBarButton( { text, setInfoPage} ) {
    const onClick = () => {
        console.log(text);
        setInfoPage(true);
    }

    return (
        <button className="button" onClick={onClick}>
            <p>{text}</p>
        </button>
    )
}