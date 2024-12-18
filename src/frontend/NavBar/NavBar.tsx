import React from 'react';
import { Link } from 'react-router-dom';
import {
    Button,
    HStack,
    Box
} from '@chakra-ui/react'
import TitleBar from './components/TitleBar.tsx';
import SideBar from './components/Sidebar.tsx';
import ResponsiveDropdown from './components/MobileDropdown.tsx';

/**
 * Navbar Component
 */
export default function NavBar({ setPage, isMobile }) {
    return (
        <div id="title-bar">
            <HStack padding="2%" gap="3%" width="100%" className="items-center justify-content">
                <SideBar />

                <Box>
                    <Link to="/" >
                        <TitleBar />
                    </Link>
                </Box>
                <div className="flex-grow"/>

                {/*Display NavBar buttons or drop-down menu depending if the user is on mobile or not*/}
                {isMobile ? (
                    <ResponsiveDropdown setPage={setPage} isMobile={isMobile} />
                ) : (
                    <div className="flex flex-row gap-2 max-lg:hidden ">

                        <Button colorScheme='yellow' onClick={() => setPage("schedules")}>
                            Schedules
                        </Button>
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

                        <Button rounded='full' colorScheme='yellow' onClick={() => setPage("about")}>
                            ?
                        </Button>

                    </div>
                )}
            </HStack>

        </div>
    );
};
