import React, { useEffect, useState } from 'react';

import Map from './Map/Map.tsx';
import About from './About/About.tsx';
import Schedules from './Schedule/Schedules.tsx';
import Alerts from './Alerts/Alerts.tsx';

export default function Pages( { isMobile } ) {
    const [page, setShownPage] = useState("map");

    // Opening a page adds a history entry, so the phone's Back button returns to the map instead of leaving the site
    const setPage = (next: string) => {
        if (next === page) return;
        if (next === "map") {
            if (window.history.state?.page) window.history.back();
            else setShownPage("map");
        } else {
            if (window.history.state?.page) window.history.replaceState({ page: next }, "", window.location.href);
            else window.history.pushState({ page: next }, "", window.location.href);
            setShownPage(next);
        }
    };

    useEffect(() => {
        const onBack = (event: PopStateEvent) => setShownPage(event.state?.page ?? "map");
        window.addEventListener("popstate", onBack);
        return () => window.removeEventListener("popstate", onBack);
    }, [])

    const setPageRef = React.useRef(setPage);
    setPageRef.current = setPage;

    useEffect(() => {
        // Lets map popups, which live outside React, switch pages
        const open = (event: Event) => setPageRef.current((event as CustomEvent).detail);
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