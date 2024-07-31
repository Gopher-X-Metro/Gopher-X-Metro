import React from 'react';
import { Link } from 'react-router-dom';
import {
    Button,
    HStack,
    Box,
    Icon,
} from '@chakra-ui/react'
import TitleBar from './components/TitleBar.tsx';
import SideBar from './components/Sidebar.tsx';

/**
 * Navbar Component
 */
export default function NavBar() {

    return (
        <div id="title-bar">
            <HStack padding="24px" gap="30px" width="100%" className="items-center justify-content">

                <SideBar />

                <Box>
                    <Link to="/" >
                        <TitleBar />
                    </Link>
                </Box>
                <div className="flex-grow"/>
                <div className=" flex flex-row gap-2 max-lg:hidden ">

                    <Link to="/schedules" >
                        <Button colorScheme='yellow'>
                            Schedules
                        </Button>
                    </Link>
                    <a href='https://pts.umn.edu/sites/pts.umn.edu/files/2020-07/bus_outline_map_printable.jpg' target="_blank" rel="noreferrer">
                        <Button colorScheme='yellow'>
                            Campus Bus Map
                        </Button>
                    </a>

                    <a href='https://umn.rider.peaktransit.com' target="_blank" rel="noreferrer">
                        <Button colorScheme='yellow'>
                            GopherTrip Map
                        </Button>
                    </a>

                    <Link to="/about" >
                        <Button rounded='full' colorScheme='yellow'>
                            ?
                        </Button>
                    </Link>

                {/* TODO: implement an alternative button that can expand to include the elements above when the user is mobile */}
                </div>
            </HStack>

        </div>
    );
};