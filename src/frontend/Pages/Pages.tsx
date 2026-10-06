import React, { useEffect, useState } from 'react';

import Map from './Map/Map.tsx';

// Secondary pages load on first visit so the map's first paint isn't waiting on them
const About = React.lazy(() => import('./About/About.tsx'));
const Schedules = React.lazy(() => import('./Schedule/Schedules.tsx'));
const Alerts = React.lazy(() => import('./Alerts/Alerts.tsx'));

// A failed chunk load (flaky network, or a tab open across a redeploy) should not take the map down with it
class PageErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    render() { return this.state.failed ? null : this.props.children; }
}

export default function Pages( { isMobile } ) {
    // A reload keeps the page that was open
    const [page, setShownPage] = useState<string>(() => window.history.state?.page ?? "map");
    // Pages stay mounted once opened (hidden, not unmounted) so their state survives like before
    const [opened, setOpened] = useState<string[]>([]);
    if (page !== "map" && !opened.includes(page)) setOpened([...opened, page]);

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

    // Remembers the route a stop popup asked for, since Schedules may not be mounted yet to hear it
    const scheduleRoute = React.useRef<string | undefined>(undefined);
    useEffect(() => {
        const remember = (event: Event) => { scheduleRoute.current = (event as CustomEvent).detail; };
        document.addEventListener("gxm:open-schedule", remember);
        return () => document.removeEventListener("gxm:open-schedule", remember);
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
            <PageErrorBoundary><React.Suspense fallback={null}>
                {opened.includes("about") && <About hidden={page !== "about"} setPage={setPage}/>}
                {opened.includes("schedules") && <Schedules hidden={page !== "schedules"} setPage={setPage} initialRouteId={scheduleRoute.current}/>}
                {opened.includes("alerts") && <Alerts hidden={page !== "alerts"} setPage={setPage}/>}
            </React.Suspense></PageErrorBoundary>
        </>
    )
}