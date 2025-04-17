import React from "react";
import { Link } from "react-router-dom";
import { Button, HStack, Box } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import TitleBar from "src/frontend/NavBar/components/TitleBar";
import SideBar from "src/frontend/NavBar/components/Sidebar";
import ResponsiveDropdown from "src/frontend/NavBar/components/MobileDropdown";
import { WarningIcon, WarningTwoIcon } from "@chakra-ui/icons";

import useIsMobile from "src/hook/useIsMobile";
import usePage from "src/hook/usePage";

/**
 * Navbar Component
 * 
 * Displays navigation bar with buttons for different pages.
 * The layout changes based on if the user is on mobile or not
 * 
 * @returns rendered NavBar component
 */
export default function NavBar() {
    return (
        <div id="title-bar">
            <HStack padding="2%" gap="3%" width="100%" className="items-center justify-content">
                <SideBar />

                <Box>
                    <Link to="/" >
                        <TitleBar />
                    </Link>
                </Box>
                <div className="flex-grow" />

                { /*Display NavBar buttons or drop-down menu depending if the user is on mobile or not*/}
                {useIsMobile() ? (
                    <ResponsiveDropdown />
                ) : (
                    <DesktopDropDown />
                )}
            </HStack>
        </div>
    );
}

function DesktopDropDown() {
    const [, setPage] = usePage();

    return (
        <div className="flex flex-row gap-2 max-lg:hidden">
            <Button colorScheme="yellow" onClick={() => setPage("schedules")}>
                Schedules
            </Button>
            <a href="https://pts.umn.edu/sites/pts.umn.edu/files/2020-07/bus_outline_map_printable.jpg" target="_blank" rel="noreferrer">
                <Button colorScheme="yellow">
                    Campus Bus Map
                </Button>
            </a>

            <a href="https://umn.rider.peaktransit.com" target="_blank" rel="noreferrer">
                <Button colorScheme="yellow">
                    GopherTrip Map
                </Button>
            </a>

            <a href="https://www.metrotransit.org/rider-alerts" target="_blank" rel="noreferrer">
                <IconButton aria-label="Alert Button" colorScheme="yellow">
                    <WarningTwoIcon />
                </IconButton>
            </a>

            <Button rounded="full" colorScheme="yellow" onClick={() => setPage("about")}>
                ?
            </Button>

        </div>
    )
}