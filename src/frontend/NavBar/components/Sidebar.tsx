import React, { useEffect, useState } from 'react';
import RouteButton from './RouteButton.tsx';
import { Icon, Image } from '@chakra-ui/react';
import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons';
import URL from 'src/backend/URL.ts';

function SideBar() {
    
    const [_, forceReload] = useState(0);

    const [routes, setRoutes] = useState(new Map<string, string>());

    const [sidebarOpen, setSidebarOpen] = useState(false);

    routes.set("121", "121 Campus Connector");
    routes.set("122", "122 University Avenue Circulator");
    routes.set("123", "123 4th Street Circulator");
    routes.set("124", "124 St. Paul Campus Circulator");
    routes.set("120", "120 East Bank Circulator");
    routes.set("2", "2 Franklin Av / To Hennepin");
    routes.set("6", "6U 27Av-Univ / Via France");
    routes.set("3", "3 U of M / Como Av / Dwtn Mpls");
    routes.set("902", "Metro Green Line");
    routes.set("901", "Metro Blue Line");

    useEffect(() => {
        /**
         * Updates the displayed routes on the sidebar
         */
        const change = () => {
            URL.getRoutes().forEach(routeId => { if (!routes.has(routeId)) routes.set(routeId, routeId); })
            setRoutes(routes);
            forceReload(Math.random());
        }
        URL.addListener(() => change())
        change();
    }, [])

    return (
        <>
            <div id="nav-bar">
                <button className="openbtn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Icon as={ HamburgerIcon} w={6} h={6} />
                </button>
            </div>

            <div id="nav-bar" className={`sidebar flex flex-col items-center ${sidebarOpen ? "bg-grey w-[100%] md:w-[40%] lg:w-[30%] p-1" : "w-0"}`}>
                <div className="nav-header">
                    <h3>Select Routes</h3>
                    <div className="underline"></div>
                </div>
                <div className='sidebar-content flex flex-col items-center'>
                    {Array.from(routes.keys()).map(routeId => (<RouteButton key={routeId} routeId={routeId} text={routes.get(routeId)}/>)) }
                </div>
            </div>
        </>
    )
}

export default SideBar;