import React, { useState } from 'react';
import URL from '../backend/URL.ts';
import Routes from './Routes.ts';
import Vehicles from './Vehicles.ts';

/**
 * Navbar Component
 */
export default function NavBar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <div id="title-bar">
                <h1>
                    <span className="gopher">Gopher Buses </span>
                    <span className="X"> X </span>
                    <span className="city"> Metro Buses</span>
                </h1>
            </div>

            <div id="nav-bar" className={`sidebar flex flex-col items-center ${sidebarOpen ? "bg-black w-[100%] md:w-[40%] lg:w-[30%] p-1" : "w-0"}`}>
                <div className="nav-header">
                    <h3>Select Routes</h3>
                    <div className="underline"></div>
                </div>
                <div className='sidebar-content flex flex-col items-center'>
                    <RouteButton routeId={"121"} text={"121 Campus Connector"} />
                    <RouteButton routeId={"122"} text={"122 University Avenue Circulator"} />
                    <RouteButton routeId={"123"} text={"123 4th Street Circulator"} />
                    <RouteButton routeId={"124"} text={"124 St. Paul Campus Circulator"} />
                    <RouteButton routeId={"120"} text={"120 East Bank Circulator"} />
                    <RouteButton routeId={"2"} text={"2 Franklin Av / To Hennepin"} />
                    <RouteButton routeId={"6"} text={"6U 27Av-Univ / Via France"} />
                    <RouteButton routeId={"3"} text={"3 U of M / Como Av / Dwtn Mpls"} />
                    <RouteButton routeId={"902"} text={"Metro Green Line"} />
                    <RouteButton routeId={"901"} text={"Metro Blue Line"} />
                </div>
            </div>

            <div id="nav-bar">
                <button className="openbtn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    &#9776;
                </button>
            </div>

            <div id="main">
                <button className="AboutButton" onClick={() => window.location.href = 'About-Page.html'}>
                    &#8942;
                </button>
            </div>
        </>
    );
};

/**
 * Creates a route button with the route that the button leads to and the route that it leads to
 * @param routeId ID of the route
 * @param text Display text of the button
 * @returns 
 */
function RouteButton({ routeId, text }) {
    const [_, setForceUpdate] = useState(0);
    const isActive = Array.from(URL.getRoutes()).includes(routeId); // used to check if route button is active

    return (
        <button className={`${isActive ? 'active' : ''} route-${routeId}`} onClick={() => {
            // selects specific route depending on button pressed
            if (!URL.getRoutes().has(routeId))
                URL.addRoute(routeId);
            else
                URL.removeRoute(routeId);


            Routes.refresh();
            Vehicles.refresh();
            setForceUpdate(Math.random()); // updates color of button click immediately
        }}>
            {text}
        </button>
    )
}
