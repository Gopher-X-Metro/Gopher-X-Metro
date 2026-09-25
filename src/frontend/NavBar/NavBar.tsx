import React from 'react';
import {
    Button,
    HStack,
    Box
} from '@chakra-ui/react'
import TitleBar from './components/TitleBar.tsx';
import { centerMap, getMap } from 'src/frontend/Pages/Map/Map';
import SideBar from './components/Sidebar.tsx';
import ResponsiveDropdown from './components/MobileDropdown.tsx';

/**
 * Navbar Component
 */
export default function NavBar({ setPage, isMobile }) {
    return (
        <div id="title-bar">
            <HStack paddingX={4} paddingY={3} gap={4} width="100%" flexWrap="nowrap" className="items-center justify-content">
                <SideBar />

                <Box>
                    <button type="button" aria-label="Back to the map, centered on campus" onClick={() => { setPage("map"); centerMap(getMap()); }}>
                        <TitleBar />
                    </button>
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
                        <Button colorScheme='yellow' onClick={() => setPage("alerts")}>
                            Bus Alerts
                        </Button>
                        <a href='https://campusmaps.umn.edu/' target="_blank" rel="noreferrer">
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
