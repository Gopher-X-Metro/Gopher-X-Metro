import React from 'react';
import { Menu, MenuButton, MenuList, MenuItem, Button, useMediaQuery } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons'; 

const ResponsiveDropdown = ({ setPage, isMobile }) => {
    return (
        <>
        {isMobile && (
            <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme='yellow'>
                </MenuButton>
                <MenuList>
                    <MenuItem onClick={() => setPage("schedules")}> 
                      Schedules
                    </MenuItem>
                    <MenuItem onClick={() => setPage("alerts")}> 
                      Bus Alerts
                    </MenuItem>
                    <MenuItem as={'a'} href='https://campusmaps.umn.edu/' target="_blank" rel="noreferrer"> 
                      Campus Bus Map
                    </MenuItem>
                    <MenuItem as={'a'} href= 'https://umn.rider.peaktransit.com' target="_blank" rel="noreferrer">
                      Gopher Trip Map
                    </MenuItem>
                    <MenuItem onClick={() => setPage("about")}>
                      About Us
                    </MenuItem>
                </MenuList>
            </Menu>
        )}
        </>
    );
};

export default ResponsiveDropdown;