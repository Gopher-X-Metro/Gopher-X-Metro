import React, { useState } from "react";
import { IoMdArrowDropright, IoMdArrowDropleft } from "react-icons/io";

export default function InfoBar() {
    const [open, setOpen] = useState(false);

    const onClick = () => {
        setOpen(!open);
    }

    return (
        <div id="info-bar" className={open ? " open" : ""}>
            <button id="info-bar-button" onClick={onClick}>
                <IoMdArrowDropleft id="info-bar-button-icon" className={open ? " open" : ""}/>
            </button>

            <div id="info-bar-content">
                
            </div>
        </div>
    )
}