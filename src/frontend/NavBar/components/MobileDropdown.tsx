import React from 'react';
import { Menu, Button, Portal } from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';
import { YELLOW_BUTTON, MENU_ITEM } from '../buttonStyle.ts';

const ResponsiveDropdown = ({ setPage, isMobile }) => {
    return (
        <>
        {isMobile && (
            <Menu.Root>
                <Menu.Trigger asChild>
                    <Button {...YELLOW_BUTTON} aria-label="Menu">
                        <FiChevronDown />
                    </Button>
                </Menu.Trigger>
                <Portal>
                    <Menu.Positioner>
                        <Menu.Content zIndex={2000} minW="14rem" py="2">
                            <Menu.Item {...MENU_ITEM} value="schedules" onClick={() => setPage("schedules")}>
                              Schedules
                            </Menu.Item>
                            <Menu.Item {...MENU_ITEM} value="alerts" onClick={() => setPage("alerts")}>
                              Bus Alerts
                            </Menu.Item>
                            <Menu.Item {...MENU_ITEM} value="campus-map" asChild>
                              <a href='https://campusmaps.umn.edu/' target="_blank" rel="noreferrer">Campus Bus Map</a>
                            </Menu.Item>
                            <Menu.Item {...MENU_ITEM} value="gopher-trip" asChild>
                              <a href='https://umn.rider.peaktransit.com' target="_blank" rel="noreferrer">Gopher Trip Map</a>
                            </Menu.Item>
                            <Menu.Item {...MENU_ITEM} value="about" onClick={() => setPage("about")}>
                              About Us
                            </Menu.Item>
                        </Menu.Content>
                    </Menu.Positioner>
                </Portal>
            </Menu.Root>
        )}
        </>
    );
};

export default ResponsiveDropdown;