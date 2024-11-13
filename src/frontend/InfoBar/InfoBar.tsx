import React, { useEffect, useState } from "react";
import InfoBarButton from "./InfoBarButton";
import URL from "src/backend/URL";

import { IoMdArrowDropleft } from "react-icons/io";
import { PiArrowBendUpLeftBold } from "react-icons/pi";

export default function InfoBar() {
    const [, forceReload] = useState(0);
    const [open, setOpen] = useState(false);
    const [infoPage, setInfoPage] = useState(false);
    const [routes, setRoutes] = useState(new Array<string>());
    const [info, setInfo] = useState<any>();

    useEffect(() => {
        const change = async () => {
            setRoutes(Array.from(URL.getRoutes()));
            forceReload(Math.random());
        }

        URL.addListener(() => {change()})

        change();
    }, [])

    const onClick = () => {
        setOpen(!open);
    }

    return (
        <div id="info-bar">
            <button id="info-bar-button" className={open ? " open" : ""} onClick={onClick}>
                <IoMdArrowDropleft className={`icon ${open ? " open" : ""}`}/>
            </button>

            <div id="info-bar-content" className={open ? " open" : ""}>
                <div id="info-bar-title">
                    <h1 id="info-bar-title-text">121</h1>
                    <p id="info-bar-title-description">bus</p>
                </div>

                <div id="button-list" hidden={infoPage}>
                    {routes.map(route => (<InfoBarButton key={route} text={route} setInfoPage={setInfoPage} setInfo={setInfo}/>))}
                </div>

                <div id="info-bar-page" hidden={!infoPage}>
                    <button id="return-button" onClick={() => setInfoPage(false)}>
                        <PiArrowBendUpLeftBold className="icon"/>
                    </button>

                    <div id="info-bar-page-content">
                        {info?.map(vehicle => (<button key={vehicle.id} className="button"><p>{vehicle.id}</p></button>))}
                    </div>
                </div>
            </div>
        </div>
    )
}