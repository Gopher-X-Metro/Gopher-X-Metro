import React, { useEffect, useState } from 'react';
import RouteButton from './RouteButton.tsx';
import { Icon } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import URL from 'src/backend/URL.ts';
import SearchIcon from "src/img/CustomBus.png";
import SearchFeature from 'src/frontend/NavBar/components/SearchFeature.tsx';
import Schedule from 'src/backend/Schedule.ts';
import Realtime from 'src/backend/Realtime.ts';
import Peak from 'src/backend/Peak.ts';

/** Saturdays during the Gopher football season, roughly late August to early December */
function isGameDaySaturday() : boolean {
    const today = new Date();
    const start = new Date(today.getFullYear(), 7, 24), end = new Date(today.getFullYear(), 11, 7);
    return today.getDay() === 6 && today >= start && today <= end;
}

export default function SideBar() {
    const [_, forceReload] = useState(0);
    const [routes, setRoutes] = useState(new Map<string, string>());
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [footballDay, setFootballDay] = useState(isGameDaySaturday());

    useEffect(() => {
        // The football shuttle only runs on game days; also show it whenever its buses are out
        Realtime.getRealtimeGTFSUniversity().then(data => {
            if (data?.vehicles?.some((v: any) => v.routeID === Peak.UNIVERSITY_ROUTES["FOOTBALL"] && !v.hidden)) setFootballDay(true);
        });
    }, [])

    routes.set("121", "121 Campus Connector");
    routes.set("122", "122 University Avenue Circulator");
    routes.set("123", "123 4th Street Circulator");
    routes.set("124", "124 St. Paul Circulator");
    routes.set("125", "125 Dinkytown Connector");
    routes.set("120", "120 East Bank Circulator");
    routes.set("126", "126 Campus Express");
    if (footballDay) routes.set("FOOTBALL", "Football Game Day Shuttle");
    routes.set("2", "2 Franklin Av / To Hennepin");
    routes.set("925", "METRO E Line (replaced 6)");
    routes.set("3", "3 U of M / Como Av / Dwtn Mpls");
    routes.set("902", "Metro Green Line");
    routes.set("901", "Metro Blue Line");

    useEffect(() => {
        // Allows the user to hit "Enter" to enter a route
        const searchBox = document.getElementById("search_route");
        searchBox?.addEventListener("keydown", event => event.code === "Enter" ? SearchFeature.searchRoute() : null);

        /**
         * Convert a string to a properly cased title
         * @param input input string
         */
        const toTitleCase = (input : string) => { 
            return input.replace( 
                /\w\S*/g, 
                text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase() 
            ); 
        }

        /**
         * Updates the displayed routes on the sidebar
         */ 
        const change = async () => {
            for (const routeId of URL.getRoutes()) {
                if (!routes.has(routeId)) {
                    const info = await Schedule.getRoute(routeId);
                    const name = info ? info.route_label : routeId;
                    routes.set(routeId, toTitleCase(name));
                }
            }

            setRoutes(routes);
            forceReload(Math.random());
        }

        URL.addListener(() => change());

        change();
    }, [])

    return (
        <>
            <div id="nav-bar">
                <button className="openbtn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Icon as={ HamburgerIcon} w={6} h={6} />
                </button>
            </div>

            <div id="nav-bar" className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
                <div className="nav-header">
                    <h3>Select Routes</h3>
                    <div className="underline"></div>
                </div>
                
                <div className='sidebar-content flex flex-col items-center'>
                    {Array.from(routes.keys()).map(routeId => (<React.Fragment key={routeId as string}><RouteButton routeId={routeId as string} text={routes.get(routeId)}/></React.Fragment>))}
                </div>

                <div className = "nav-header"> 
                    <h1> Search Routes </h1>
                    <div className="underline"></div>
                    <br></br>
                </div> 
                
                <div className = "searchContainer">
                    <input type = "text" id = "search_route" placeholder = "902"></input>
                    <button onClick = {SearchFeature.searchRoute} id = "searchButton">
                        <img className = "busImg" height = "50" alt = "error" width = "50" src={SearchIcon}></img>
                    </button>
                </div>
                
                <div className= "error_text" id = 'error_text'></div>
            </div>
        </>
    )
    
}
