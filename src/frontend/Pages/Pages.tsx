import React, { useEffect, useState } from "react";
import Map from "src/frontend/Pages/Map/Map";
import About from "src/frontend/Pages/About/About";
import Schedules from "src/frontend/Pages/Schedule/Schedules";

/**
 * Rendered WebPage
 * @returns rendered WebPage
 */
export default function Pages() {
    return (
        <>
            <Map />
            <About />
            <Schedules />
        </>
    );
}