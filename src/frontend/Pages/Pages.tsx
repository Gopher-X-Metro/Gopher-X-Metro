import React, { useState } from 'react';

import Map from './Map/Map.tsx';
import About from './About/About.tsx';
import Schedules from './Schedule/Schedules.tsx';

export default function Pages( { isMobile } ) {
    const [page, setPage] = useState("map");

    return (
        <>
            <Map hidden={page!=="map"} setPage={setPage} isMobile={isMobile}/>
            <About hidden={page!=="about"} setPage={setPage}/>
            <Schedules hidden={page!=="schedules"} setPage={setPage}/>
        </>
    )
}