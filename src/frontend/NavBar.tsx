import React, { useState } from 'react';
import URL from '../backend/URL.ts';
import Routes from './Routes.ts';
import Vehicles from './Vehicles.ts';
import { Link } from 'react-router-dom';
import { 
    Button,     
    ButtonGroup, 
    Heading, 
    extendTheme,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuItemOption,
    MenuGroup,
    MenuOptionGroup,
    MenuDivider,
        
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons';

/**
 * Navbar Component
 */
export default function NavBar() {

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
                    <Heading as='h1' size='2xl' pos='absolute' top='1.5' left='200'>
                        <Heading display='inline-block' color='#FFCC33' margin='1'>Gopher Buses </Heading>
                        <Heading display='inline-block' margin='1' style={xStyle}> X </Heading>
                        <Heading display='inline-block' color ='#0053A0' margin='1'> Metro Buses </Heading>
                    </Heading>
                </Link>
            </div>
            
            <div id = "nav-bar">
                <Menu top="5" left="5" closeOnSelect={false}>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} margin='5' colorScheme='yellow' >
                        Routes
                    </MenuButton>
                    <MenuList>
                        <MenuOptionGroup title="University Buses" type='checkbox'>
                            <RouteMenuItem routeId={'121'} text={"121 Campus Connector"} />
                            <RouteMenuItem routeId={'122'} text={"122 University Avenue Circulator"} />
                            <RouteMenuItem routeId={'123'} text={"123 4th Street Circulator"} />
                            <RouteMenuItem routeId={'124'} text={"124 St. Paul Campus Circulator"} />
                            <RouteMenuItem routeId={'120'} text={"120 East Bank Circulator"} />
                        </MenuOptionGroup>
                        <MenuOptionGroup title='Metro Buses' type='checkbox'>
                            <RouteMenuItem routeId={'2'} text={"2 Franklin Av / To Hennepin"} />
                            <RouteMenuItem routeId={'6'} text={"6U 27Av-Univ / Via France"} />
                            <RouteMenuItem routeId={'3'} text={"3 U of M / Como Av / Dwtn Mpls"} />
                        </MenuOptionGroup>
                        <MenuOptionGroup title='Metro Trains' type='checkbox'>
                            <RouteMenuItem routeId={'902'} text={"Metro Green Line"} />
                        <RouteMenuItem routeId={'901'} text={"Metro Blue Line"} />
                        </MenuOptionGroup>
                    </MenuList>
                </Menu>
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
function RouteMenuItem({routeId, text}) {
    return (
      <MenuItemOption value={routeId} onClick={() => {
        // selects specific route depending on button pressed
        console.log(typeof routeId);
        if (!URL.getRoutes().has(routeId))
            URL.addRoute(routeId);
        else 
            URL.removeRoute(routeId);
        
      
        Routes.refresh();
        Vehicles.refresh();
      }}>
        {text}
      </MenuItemOption> 
    )
}
