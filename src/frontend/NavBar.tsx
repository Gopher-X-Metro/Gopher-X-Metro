import React, { useState } from 'react';
import URL from '../backend/URL.ts';
import Routes from './Routes.ts';
import Vehicles from './Vehicles.ts';


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
            
            <div id="nav-bar" className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
                <div className="nav-header">
                <h3>Select Routes</h3>
                <div className="underline"></div>
                </div>
                <div className="sidebar-content">
                <RouteButton route={"121"} text={"121 Campus Connector"}/>
                <RouteButton route={"122"} text={"122 University Avenue Circulator"}/>
                <RouteButton route={"123"} text={"123 4th Street Circulator"}/>
                <RouteButton route={"124"} text={"124 St. Paul Campus Circulator"}/>
                <RouteButton route={"120"} text={"120 East Bank Circulator"}/>
                <RouteButton route={"2"} text={"2 Franklin Av / To Hennepin"}/>
                <RouteButton route={"6"} text={"6U 27Av-Univ / Via France"}/>
                <RouteButton route={"3"} text={"3 U of M / Como Av / Dwtn Mpls"}/>
                <RouteButton route={"902"} text={"Metro Green Line"}/>
                <RouteButton route={"901"} text={"Metro Blue Line"}/>
                </div>
            </div>

            <div id="nav-bar">
                <button className="openbtn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                &#9776;
                </button>
            </div>

            <div id = "main">
                <button className="AboutButton" onClick={() => window.location.href = 'About-Page.html'}>
                &#8942;
                </button>
            </div>
        </>
    );
};

// Creates a route button with the route that the button leads to and the route that it leads to
function RouteButton({route, text}) {
    const [_, setForceUpdate] = useState(0);
    const isActive = URL.getRoutes().includes(route); // used to check if route button is active

    return (
      <button className={`route-btn ${isActive ? 'active' : ''} route-${route}`} onClick={() => {
        // selects specific route depending on button pressed
        if (URL.getRoutes().indexOf(route) === -1) {
            URL.addRoute(route);
        } else {
            URL.removeRoute(route);
        }
      
        Routes.refresh();
        Vehicles.refresh();
        setForceUpdate(Math.random()); // updates color of button click immediately
      }}>
        {text}
      </button> 
    )
}
