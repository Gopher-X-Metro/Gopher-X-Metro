import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Button,
} from '@chakra-ui/react'
import TitleBar from './components/TitleBar.tsx';

/**
 * Navbar Component
 */
export default function NavBar() {

    return (
        <div id="title-bar">
            <div>
                <Link to="/" >
                    <TitleBar/>
                </Link>
            </div>
            
            <div id = "nav-bar" >
            </div>

            <div id = "main">
                <Link to="/schedules" >
                    <Button pos="absolute" top="5" right="5" colorScheme='yellow'>
                        Schedules
                    </Button>
                </Link>
                <view width={50}></view>
                <a href='https://pts.umn.edu/sites/pts.umn.edu/files/2020-07/bus_outline_map_printable.jpg' target="_blank" rel="noreferrer">
                    <Button pos="absolute" top="5" right="150" colorScheme='yellow'>
                        Campus Bus Map
                    </Button>
                </a>
                <view width={50}></view>

                <a href='https://umn.rider.peaktransit.com' target="_blank" rel="noreferrer">
                    <Button pos="absolute" top="5" right="335" colorScheme='yellow'>
                        GopherTrip Map
                    </Button>
                </a>
            </div>
        </div>
    );
};
