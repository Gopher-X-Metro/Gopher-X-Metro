import React, {useState} from 'react';
import RouteButton from './RouteButton.tsx';

function SideBar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    return (
        <>
            <div id="nav-bar">
                <button className="openbtn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    &#9776;
                </button>
            </div>

            <div id="nav-bar" className={`sidebar flex flex-col items-center ${sidebarOpen ? "bg-grey w-[100%] md:w-[40%] lg:w-[30%] p-1" : "w-0"}`}>
                <div className="nav-header">
                    <h3>Select Routes</h3>
                    <div className="underline"></div>
                </div>
                <div className='sidebar-content flex flex-col items-center'>
                    <RouteButton routeId={"121"} text={"121 Campus Connector"} />
                    <RouteButton routeId={"122"} text={"122 University Avenue Circulator"} />
                    <RouteButton routeId={"123"} text={"123 4th Street Circulator"} />
                    <RouteButton routeId={"124"} text={"124 St. Paul Campus Circulator"} />
                    <RouteButton routeId={"120"} text={"120 East Bank Circulator"} />
                    <RouteButton routeId={"2"} text={"2 Franklin Av / To Hennepin"} />
                    <RouteButton routeId={"6"} text={"6U 27Av-Univ / Via France"} />
                    <RouteButton routeId={"3"} text={"3 U of M / Como Av / Dwtn Mpls"} />
                    <RouteButton routeId={"902"} text={"Metro Green Line"} />
                    <RouteButton routeId={"901"} text={"Metro Blue Line"} />
                </div>
            </div>
        </>
    )
}

export default SideBar;