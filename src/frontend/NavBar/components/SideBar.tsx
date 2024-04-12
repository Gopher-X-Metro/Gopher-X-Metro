import React, {useState} from 'react';
import RouteButton from './RouteButton.tsx';
import search_route from './Search_feature.tsx';
import SearchIcon from "../../../img/CustomBus.png";

function SideBar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    return (
        <>
            <div id="nav-bar">
                <button className="openbtn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                &#9776;
                </button>
            </div>

            <div id="nav-bar" className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
                <div className="nav-header">
                <h3>Select Routes</h3>
                <div className="underline"></div>
                </div>
                <div className="sidebar-content">
                <RouteButton routeId={"121"} text={"121 Campus Connector"}/>
                <RouteButton routeId={"122"} text={"122 University Avenue Circulator"}/>
                <RouteButton routeId={"123"} text={"123 4th Street Circulator"}/>
                <RouteButton routeId={"124"} text={"124 St. Paul Campus Circulator"}/>
                <RouteButton routeId={"120"} text={"120 East Bank Circulator"}/>
                <RouteButton routeId={"2"} text={"2 Franklin Av / To Hennepin"}/>
                <RouteButton routeId={"6"} text={"6U 27Av-Univ / Via France"}/>
                <RouteButton routeId={"3"} text={"3 U of M / Como Av / Dwtn Mpls"}/>
                <RouteButton routeId={"902"} text={"Metro Green Line"}/>
                <RouteButton routeId={"901"} text={"Metro Blue Line"}/>
                </div>
                

                <div className = "nav-header"> 
                <h1> Search routes </h1>
                <div className="underline"></div><br></br>
                </div> 
                <div className = "searchContainer">
                <input type = "text" id = "search_route" placeholder = "123"></input>
                <button onClick = {search_route} id = "searchButton">
                <img className = "busImg" height = "50" width = "50" src={SearchIcon}></img>
               
                </button>

                <div className= "error"></div>
                </div>



            </div>
        </>
    )
}

export default SideBar;