import React from 'react';
import { 
    Button,     
    Menu,
    MenuButton,
    MenuList,
    MenuOptionGroup,
    MenuDivider,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons';
import RouteMenuItem from './RouteMenuItem.tsx';
import SearchFeature from '../SearchFeature.tsx';
import SearchIcon from "../../../../img/CustomBus.png";
///Users/babacardia/Downloads/Gopher-Bus-X-Metro-Buses-recent/src/img/CustomBus.png
export default function SideBar() {
    return(
        <div>
        <Menu top="5" left="5" closeOnSelect={false}>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} margin='5' colorScheme='yellow' >
            Routes
        </MenuButton>
        <MenuList>
            <MenuOptionGroup title="University Buses" type='checkbox'>
                <RouteMenuItem routeId={'121'} text={"121 Campus Connector"} />
                <RouteMenuItem routeId={'122'} text={"122 University Avenue Circulator"} />
                <RouteMenuItem routeId={'123'} text={"123 4th Street Circulator"} />
                <RouteMenuItem routeId={'124'} text={"124 St. Paul Campus Circulator"} />
                <RouteMenuItem routeId={'120'} text={"120 East Bank Circulator"} />
            </MenuOptionGroup>
            <MenuDivider />
            <MenuOptionGroup title='Metro Buses' type='checkbox'>
                <RouteMenuItem routeId={'2'} text={"2 Franklin Av / To Hennepin"} />
                <RouteMenuItem routeId={'6'} text={"6U 27Av-Univ / Via France"} />
                <RouteMenuItem routeId={'3'} text={"3 U of M / Como Av / Dwtn Mpls"} />
            </MenuOptionGroup>
            <MenuDivider />
            <MenuOptionGroup title='Metro Trains' type='checkbox'>
                <RouteMenuItem routeId={'902'} text={"Metro Green Line"} />
                <RouteMenuItem routeId={'901'} text={"Metro Blue Line"} />
                </MenuOptionGroup>
            </MenuList>
        </Menu>

        <div className = "nav-header"> 
                <h1> Search routes </h1>
                <div className="underline"></div><br></br>
                </div> 
                <div className = "searchContainer">
                <input type = "text" id = "search_route" placeholder = "123"></input>
                <button onClick = {SearchFeature.searchRoute} id = "searchButton">
                <img className = "busImg" height = "50" width = "50" src={SearchIcon}></img>
                </button>
                <div className= "error"></div>
        </div>




        </div>
    )
}