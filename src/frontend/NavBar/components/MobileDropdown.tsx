import React from "react";
import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { ChevronDownIcon } from "@chakra-ui/icons"; 

/**
 * ResponsiveDropdown Component
 * 
 * Component that renders a dropdown menu for mobile devices. Shows various menu options 
 * that allow navigation to different pages or external links such as the schedules, campus bus map, 
 * GopherTrip map, and an 'About Us' section. 
 * 
 * The dropdown will only be displayed if the user is on a mobile device
 * 
 * @param setPage callback function to update current page when menu item is selected
 * @param isMobile boolean indicating if user is on a mobile device
 * 
 * @returns rendered dropdown component
 */
const ResponsiveDropdown = ({ setPage, isMobile }) => {
  return (
    <>
    {isMobile && (
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="yellow"></MenuButton>
        <MenuList>
            <MenuItem as={Link} onClick={() => setPage("schedules")}> 
              Schedules
            </MenuItem>
            <MenuItem as={"a"} href="https://pts.umn.edu/sites/pts.umn.edu/files/2020-07/bus_outline_map_printable.jpg" target="_blank" rel="noreferrer"> 
              Campus Bus Map
            </MenuItem>
            <MenuItem as={"a"} href="https://umn.rider.peaktransit.com" target="_blank" rel="noreferrer">
              Gopher Trip Map
            </MenuItem>
            <MenuItem as={"a"} href="https://www.metrotransit.org/rider-alerts" target="_blank" rel="noreferrer">
              Metro Rider Alerts
            </MenuItem>
            <MenuItem as={Link} onClick={() => setPage("about")}>
              About Us
            </MenuItem>
          </MenuList>
      </Menu>
    )}
    </>
  );
}

export default ResponsiveDropdown;