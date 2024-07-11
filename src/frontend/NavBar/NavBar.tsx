import React from 'react';
import { Link } from 'react-router-dom';
import {
    Button,
    HStack,
    Box,
} from '@chakra-ui/react'
import TitleBar from './components/TitleBar.tsx';
import SideBar from './components/Sidebar.tsx';

/**
 * Navbar Component
 */
export default function NavBar() {

    return (
        <div id="title-bar">
            <HStack padding="3px">

            <SideBar />
                <Box>
                    <Link to="/" >
                        <TitleBar />
                    </Link>
                </Box>
                <div id="main">
                    <Link to="/schedules" >
                        <Button pos="absolute" top="5" right="5" colorScheme='yellow'>
                            Schedules
                        </Button>
                    </Link>
                    <a href='https://pts.umn.edu/sites/pts.umn.edu/files/2020-07/bus_outline_map_printable.jpg' target="_blank" rel="noreferrer">
                        <Button pos="absolute" top="5" right="150" colorScheme='yellow'>
                            Campus Bus Map
                        </Button>
                    </a>

                    <a href='https://umn.rider.peaktransit.com' target="_blank" rel="noreferrer">
                        <Button pos="absolute" top="5" right="335" colorScheme='yellow'>
                            GopherTrip Map
                        </Button>
                    </a>

                    <Link to="/about" >
                        <Button pos="absolute" top="5" right="520" colorScheme='yellow'>
                            About
                        </Button>
                    </Link>


                </div>
            </HStack>

        </div>
    );
};
