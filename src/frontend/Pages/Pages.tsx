import React, { useState } from "react";

import Map from "src/frontend/Pages/Map/Map";
import About from "src/frontend/Pages/About/About";
import Schedules from "src/frontend/Pages/Schedule/Schedules";

/**
 * Rendered WebPage
 * @param isMobile if user is on mobile or not
 * @returns rendered WebPage
 */
export default function Pages() {
    const [page, setPage] = useState("map");

    return (
        <>
            <Map hidden={page !== "map"} setPage={setPage} />
            <About hidden={page !== "about"} setPage={setPage} />
            <Schedules hidden={page !== "schedules"} setPage={setPage} />
        </>
    );
}