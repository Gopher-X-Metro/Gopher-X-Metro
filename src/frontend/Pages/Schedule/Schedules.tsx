import React, { useState } from 'react';

import { ChevronDownIcon } from '@chakra-ui/icons';


import {
    Menu,
    MenuButton,
    MenuList,
    // MenuItem,
    MenuItemOption,
    // MenuGroup,
    MenuOptionGroup,
    // MenuDivider,
    Button,
} from '@chakra-ui/react';

import ScheduleTable from './components/ScheduleTable.tsx';

export default function Schedules({ hidden, setPage }) {
    const [selectedSchedule, setSelectedSchedule] = useState(121);

    return (
        <div hidden={hidden}>
            <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} margin='5'>
                    Schedules
                </MenuButton>
                <MenuList>
                    <MenuOptionGroup defaultValue='121' title="University Buses" type='radio'>
                        <MenuItemOption value='121' onClick={() => setSelectedSchedule(121)}>121 Campus Connector</MenuItemOption>
                        <MenuItemOption value='122' onClick={() => setSelectedSchedule(122)}>122 University Avenue Circulator</MenuItemOption>
                        <MenuItemOption value='123' onClick={() => setSelectedSchedule(123)}>123 4th Street Circulator</MenuItemOption>
                        <MenuItemOption value='124' onClick={() => setSelectedSchedule(124)}>124 St. Paul Circulator</MenuItemOption>
                        <MenuItemOption value='125' onClick={() => setSelectedSchedule(125)}>125 Dinkytown Connector</MenuItemOption>
                        <MenuItemOption value='120' onClick={() => setSelectedSchedule(120)}>120 East Bank Circulator</MenuItemOption>
                    </MenuOptionGroup>
                </MenuList>
            </Menu>
            <Button colorScheme='yellow' onClick={() => setPage("map")}>
                Back to Map
            </Button>
            <ScheduleTable selectedSchedule={selectedSchedule} />
        </div>
    )
}