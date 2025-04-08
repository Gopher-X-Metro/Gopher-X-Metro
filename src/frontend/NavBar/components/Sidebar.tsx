
import React, { useEffect, useState } from "react";
import { Icon } from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import RouteButton from "src/frontend/NavBar/components/RouteButton";
import URL from "src/backend/URL";
import SearchFeature from "src/frontend/NavBar/components/SearchFeature";
import Schedule from "src/backend/Schedule";
import Clearall from "src/frontend/NavBar/components/Clearall";
import SearchIcon from "src/img/CustomBus.png";

// Add "FOOTBALL" route only if its a Saturday in-season
const currentDate = new Date();
const currentDay = currentDate.getDay(); // 0 = Sunday ... 6 = Saturday

const startDate = new Date(currentDate.getFullYear(), 7, 24); // August 24
const endDate = new Date(currentDate.getFullYear(), 11, 7);  // December 7

const isSaturday = currentDay === 6; 
const isInSeason = currentDate >= startDate && currentDate <= endDate; 

const predefinedRoutes = new Map([
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
    ["901", "Metro Blue Line"],
]);
    
if (isSaturday && isInSeason) {
    predefinedRoutes.set("FOOTBALL", "Football Game Day Route");
}

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
    const [routes, setRoutes] = useState<Map<string, string>>(predefinedRoutes);
    // State to track whether sidebar is open or closed
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toggle, setToggle] = useState(1); //switching between tabs

    const updateToggle = (id) => {setToggle(id)};

    routes.set("121", "121 Campus Connector");
    routes.set("122", "122 University Avenue Circulator");
    routes.set("123", "123 4th Street Circulator");
    routes.set("124", "124 St. Paul Circulator");
    routes.set("125", "125 Dinkytown Connector");
    routes.set("120", "120 East Bank Circulator");
    routes.set("2", "2 Franklin Av / To Hennepin");
    routes.set("6", "6U 27Av-Univ / Via France");
    routes.set("3", "3 U of M / Como Av / Dwtn Mpls");
    routes.set("902", "Metro Green Line");
    routes.set("901", "Metro Blue Line");

    useEffect(() => {
        // Allows user to hit "Enter" to enter a route
        // const searchBox = document.getElementById("search_route");
        // searchBox?.addEventListener("keydown", event => event.code === "Enter" ? SearchFeature.searchRoute() : null);

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
            const activeRoutes = new Set(URL.getRoutes()); //gets active routes
            const newRoutes = new Map<string, string>(routes);
            for (const routeId of activeRoutes) {
                // Fetch route info if not already in routes map
                if (!newRoutes.has(routeId)) {
                    const info = await Schedule.getRoute(routeId);
                    const name = info ? info.route_label : routeId;
                    newRoutes.set(routeId, toTitleCase(name));
                }
            }
            setRoutes(new Map(newRoutes));
            forceReload(Math.random());
        }

    URL.addListener(() => change());

    change();
    return () => {
        URL.removeListener(change);
        console.log("url updated");
    }
       
    }, []); // empty dependency array needed to stop infinite render loop

    return (
        <>
            <div id="nav-bar">
                <button className="openbtn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Icon as={HamburgerIcon} w={6} h={6} />
                </button>
            </div>

    <div id="nav-bar" className={sidebarOpen ? "sidebar open" : "sidebar"}>
        <div className="sidebar-content">
                    <div className="tab-container-sidebar">
                            <button className ="routes-tab" onClick = {() => updateToggle(1)}>Routes</button>
                            <button className="favorite-tab" onClick = {() => updateToggle(2)}>Favorites</button>
                    </div>
            <div className={toggle === 1 ? "tab-content" : "content"}>
                    
                    <div className="Clear-container">
                         <button className="Clear-all-btn" onClick={Clearall.clearRoutes}>Clear Routes</button>  
                    </div>

                    <div className="select-header">
                        <h3>Select Routes</h3>
                        <div className="underline"></div>
                    </div>

                    {Array.from(routes.keys()).map(routeId => (<RouteButton key={routeId} routeId={routeId} text={routes.get(routeId)}/>))}
                    
                   <div>
                   <SearchFeature></SearchFeature>
                   </div>

                    {/* <div id="Favorite-routeButton"></div>
                    <div className = "search-header"> 
                        <h3> Search Routes </h3>
                        <div className="underline"></div>
                    </div> 
                    
                 <div className = "searchContainer">
                        <input type = "text" id = "search_route" placeholder = "902"></input>
                        <button onClick = {SearchFeature.searchRoute} id = "searchButton">
                            <img className = "busImg" height = "50" alt = "error" width = "50" src={SearchIcon}></img>
                        </button>
                    </div>

                    <div className= "error_text" id = "error_text"></div> */}
            </div>
                    <div className={toggle === 2 ? "tab-content" : "content"}>
                        <div className="favorite-header">
                            <h3> Favorited Routes </h3>
                            <div className="underline"></div>
                        </div>
                        <div id="Favorite-tab" ></div> 
                    </div>
            </div>
        </div>
    </>
    );
}