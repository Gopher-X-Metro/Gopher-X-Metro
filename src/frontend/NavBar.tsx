import React, { useState } from 'react';
import URL from '../backend/URL.ts';
import Routes from './Routes.ts';
import Vehicles from './Vehicles.ts';
import { Link } from 'react-router-dom';
import { Button, ButtonGroup, Heading, extendTheme } from '@chakra-ui/react'

/**
 * Navbar Component
 */
export default function NavBar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const xStyle = {
        'background': "linear-gradient(to right, #FFCC33 50%, #0053A0 50%)",
        'background-clip': 'text',
        'WebkitBackgroundClip': 'text',
        'WebkitTextFillColor': 'transparent',
    }

    return (
        <div id="title-bar">
            <div>
                <Link to="/" >
                    <Heading as='h1' size='2xl' pos='absolute' top='1.5' left='100'>
                        <Heading display='inline-block' color='#FFCC33' margin='1'>Gopher Buses </Heading>
                        <Heading display='inline-block' margin='1' style={xStyle}> X </Heading>
                        <Heading display='inline-block' color ='#0053A0' margin='1'> Metro Buses </Heading>
                    </Heading>
                </Link>
            </div>
            


            <div id="nav-bar" className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
                <div className="nav-header">
                <h3>Select Routes</h3>
                <div className="underline"></div>
                </div>
                <div className="sidebar-content">
                <RouteButton routeId={"121"} text={"121 Campus Connector"}/>
                <RouteButton routeId={"122"} text={"122 University Avenue Circulator"}/>
                <RouteButton routeId={"123"} text={"123 4th Street Circulator"}/>
                <RouteButton routeId={"124"} text={"124 St. Paul Campus Circulator"}/>
                <RouteButton routeId={"120"} text={"120 East Bank Circulator"}/>
                <RouteButton routeId={"2"} text={"2 Franklin Av / To Hennepin"}/>
                <RouteButton routeId={"6"} text={"6U 27Av-Univ / Via France"}/>
                <RouteButton routeId={"3"} text={"3 U of M / Como Av / Dwtn Mpls"}/>
                <RouteButton routeId={"902"} text={"Metro Green Line"}/>
                <RouteButton routeId={"901"} text={"Metro Blue Line"}/>
                </div>
            </div>

            <div id = "nav-bar">
                <Button pos="absolute" top="5" left="5" colorScheme='yellow' onClick={() => setSidebarOpen(!sidebarOpen)}>
                    &#9776;
                </Button>
            </div>

            <div id = "main">
                <Link to="/schedules" >
                    <Button pos="absolute" top="5" right="5" colorScheme='yellow'>
                        Schedules
                    </Button>
                </Link>
                <view width={50}></view>
                <a href='https://pts.umn.edu/Transit/Transit-Services/Campus-Buses' target="_blank" rel="noreferrer">
                    <Button pos="absolute" top="5" right="150" colorScheme='yellow'>
                        Campus Bus Map
                    </Button>
                </a>
                <view width={50}></view>

                <a href='https://umn.rider.peaktransit.com' target="_blank" rel="noreferrer">
                    <Button pos="absolute" top="5" right="335" colorScheme='yellow'>
                        GopherTrip Map
                    </Button>
                </a>
            </div>
        </div>
    );
};

/**
 * Creates a route button with the route that the button leads to and the route that it leads to
 * @param routeId ID of the route
 * @param text Display text of the button
 * @returns 
 */
function RouteButton({routeId, text}) {
    const [_, setForceUpdate] = useState(0);
    const isActive = Array.from(URL.getRoutes()).includes(routeId); // used to check if route button is active

    return (
      <button className={`route-btn ${isActive ? 'active' : ''} route-${routeId}`} onClick={() => {
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
