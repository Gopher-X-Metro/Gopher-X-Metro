import React, { useState } from 'react';

  import { ChevronDownIcon } from '@chakra-ui/icons';

  import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuItemOption,
    MenuGroup,
    MenuOptionGroup,
    MenuDivider,
    Button,
  } from '@chakra-ui/react';

import ScheduleTable from './components/ScheduleTable.tsx';

export default function Schedules(){

    const [selectedSchedule, setSelectedSchedule] = useState(121);

    return(
        <div>
            <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} margin='5'>
                Schedules
            </MenuButton>
            <MenuList>
                <MenuItem onClick={() => setSelectedSchedule(121)}>121 Campus Connector</MenuItem>
                <MenuItem onClick={() => setSelectedSchedule(122)}>122 University Avenue Circulator</MenuItem>
                <MenuItem onClick={() => setSelectedSchedule(123)}>123 4th Street Circulator</MenuItem>
                <MenuItem onClick={() => setSelectedSchedule(124)}>124 St. Paul Campus Circulator</MenuItem>
                <MenuItem onClick={() => setSelectedSchedule(120)}>120 East Bank Circulator</MenuItem>
            </MenuList>
            </Menu>
            <ScheduleTable selectedSchedule={selectedSchedule}/>
        </div>
    )
}