import React from 'react';
import { Menu, MenuButton, MenuList, MenuItem, Button, useMediaQuery } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '@chakra-ui/icons'; 

const ResponsiveDropdown = ({ setPage }) => {
    // Check if the screen width is 1024px or less (common mobile size and before buttons are cutoff by title)
    const [isMobile] = useMediaQuery("(max-width: 1024px)");

    return (
        <>
        {isMobile && (
            <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme='yellow'>
                </MenuButton>
                <MenuList>
                    <MenuItem as={Link} onClick={() => setPage("schedules")}> 
                      Schedules
                    </MenuItem>
                    <MenuItem as={'a'} href='https://pts.umn.edu/sites/pts.umn.edu/files/2020-07/bus_outline_map_printable.jpg' target="_blank" rel="noreferrer"> 
                      Campus Bus Map
                    </MenuItem>
                    <MenuItem as={'a'} href= 'https://umn.rider.peaktransit.com' target="_blank" rel="noreferrer">
                      Gopher Trip Map
                    </MenuItem>
                    <MenuItem as={Link} onClick={() => setPage("about")}>
                      About Us
                    </MenuItem>
                </MenuList>
            </Menu>
        )}
        </>
    );
};

export default ResponsiveDropdown;