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
                <MenuOptionGroup defaultValue='121' title="University Buses" type='radio'>
                <MenuItemOption key='1' value='121' onClick={() => setSelectedSchedule(121)}>121 Campus Connector</MenuItemOption>
                <MenuItemOption key='2' value='122' onClick={() => setSelectedSchedule(122)}>122 University Avenue Circulator</MenuItemOption>
                <MenuItemOption key='3' value='123' onClick={() => setSelectedSchedule(123)}>123 4th Street Circulator</MenuItemOption>
                <MenuItemOption key='4' value='124' onClick={() => setSelectedSchedule(124)}>124 St. Paul Campus Circulator</MenuItemOption>
                <MenuItemOption key='5' value='120' onClick={() => setSelectedSchedule(120)}>120 East Bank Circulator</MenuItemOption>
                </MenuOptionGroup>
            </MenuList>
            </Menu>
            
            <ScheduleTable selectedSchedule={selectedSchedule}/>
        </div>
    )
}