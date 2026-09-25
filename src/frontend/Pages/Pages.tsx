import React, { useEffect, useState } from 'react';

import Map from './Map/Map.tsx';
import About from './About/About.tsx';
import Schedules from './Schedule/Schedules.tsx';
import Alerts from './Alerts/Alerts.tsx';

export default function Pages( { isMobile } ) {
    const [page, setPage] = useState("map");

    useEffect(() => {
        // Lets map popups, which live outside React, switch pages
        const open = (event: Event) => setPage((event as CustomEvent).detail);
        document.addEventListener("gxm:open-page", open);
        return () => document.removeEventListener("gxm:open-page", open);
    }, [])

    return (
        <>
            <Map hidden={page!=="map"} setPage={setPage} isMobile={isMobile}/>
            <About hidden={page!=="about"} setPage={setPage}/>
            <Schedules hidden={page!=="schedules"} setPage={setPage}/>
            <Alerts hidden={page !== "alerts"} setPage={setPage}/>
        </>
    )
}