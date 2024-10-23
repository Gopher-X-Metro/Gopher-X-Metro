import React, { useEffect, useState } from "react";

import { Icon } from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

import URL from "src/backend/URL.ts";
import Schedule from "src/backend/Schedule.ts";
import RouteButton from "src/frontend/NavBar/components/RouteButton";
import SearchFeature from "src/frontend/NavBar/components/SearchFeature";
import SearchIcon from "src/img/CustomBus.png";

// Predefined routes data outside the component
const predefinedRoutes = new Map<string, string>([
    ["121", "121 Campus Connector"],
    ["122", "122 University Avenue Circulator"],
    ["123", "123 4th Street Circulator"],
    ["124", "124 St. Paul Circulator"],
    ["125", "125 Dinkytown Connector"],
    ["120", "120 East Bank Circulator"],
    ["2", "2 Franklin Av / To Hennepin"],
    ["6", "6U 27Av-Univ / Via France"],
    ["3", "3 U of M / Como Av / Dwtn Mpls"],
    ["902", "Metro Green Line"],
    ["901", "Metro Blue Line"]
]);

/**
 * Sidebar Component
 * 
 * Component renders a collapsible sidebar for selecting and searching routes.
 * Displays a list of available routes that users can toggle on or off, and includes
 * a search feature that allows users to search routes by ID
 * 
 * @returns rendered Sidebar component
 */
export default function SideBar() {
    // State to force component to reload when route data changes
    const [_, forceReload] = useState(0);

    // State to manage routes displayed in sidebar
    const [routes, setRoutes] = useState(predefinedRoutes);

    // State to track whether sidebar is open or closed
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // Allows user to hit "Enter" to enter a route
        const searchBox = document.getElementById("search_route");
        searchBox?.addEventListener("keydown", event => event.code === "Enter" ? SearchFeature.searchRoute() : null);

        /**
         * Convert a string to a properly cased title
         * @param input input string
         * @returns input string converted to title case
         */
        const toTitleCase = (input : string) : string => { 
            return input.replace( 
                /\w\S*/g, 
                text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase() 
            ); 
        }

        /**
         * Updates displayed routes on sidebar based on routes returned from URL
         */ 
        const change = async () => {
            const newRoutes = new Map(routes);
            for (const routeId of URL.getRoutes()) {
                // Fetch route info if not already in routes map
                if (!newRoutes.has(routeId)) {
                    const info = await Schedule.getRoute(routeId);
                    const name = info ? info.route_label : routeId;
                    newRoutes.set(routeId, toTitleCase(name));
                }
            }
            setRoutes(newRoutes);
            forceReload(Math.random());
        }

        URL.addListener(() => change());

        change();
    }, []); // empty dependency array needed to stop infinite render loop

    return (
        <>
            <div id="nav-bar">
                <button className="openbtn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Icon as={HamburgerIcon} w={6} h={6} />
                </button>
            </div>

            <div id="nav-bar" className={sidebarOpen ? "sidebar open" : "sidebar"}>
                <div className="nav-header">
                    <h3>Select Routes</h3>
                    <div className="underline"></div>
                </div>
                
                <div className="sidebar-content flex flex-col items-center">
                    {Array.from(routes.keys()).map(routeId => (
                        <RouteButton key={routeId} routeId={routeId} text={routes.get(routeId)} />
                    ))}
                </div>

                <div className="nav-header"> 
                    <h1> Search Routes </h1>
                    <div className="underline"></div>
                    <br></br>
                </div> 
                
                <div className="searchContainer">
                    <input type="text" id="search_route" placeholder="902"></input>
                    <button onClick={SearchFeature.searchRoute} id="searchButton">
                        <img className="busImg" height="50" alt="error" width="50" src={SearchIcon}></img>
                    </button>
                </div>
                
                <div className="error_text" id="error_text"></div>
            </div>
        </>
    );
}