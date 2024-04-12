import React from "react";

import "./styles.css";

function About() {
    return (
        <>
            {/* <!-- Responsive navbar--> */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <a className="navbar-brand" href="./">Back to Map</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon"></span></button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item"><a className="nav-link active" aria-current="page" href="https://pts.umn.edu/Transit/Transit-Services/Campus-Buses">Campus Bus Map</a></li>
                            <li className="nav-item"><a className="nav-link" href="https://umn.rider.peaktransit.com/">GopherTrip Map</a></li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" id="navbarDropdown" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Maps and Schedules</a>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                    <li><a className="dropdown-item" href="https://umn.rider.peaktransit.com/">GopherTrip Map</a></li>
                                    <li><a className="dropdown-item" href="https://pts.umn.edu/Transit/Transit-Services/Campus-Buses">Campus Bus Map</a></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><a className="dropdown-item" href="#">Something else here</a></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            {/* <!-- Page content--> */}
            <div className="container">
                <div className="text-center mt-5">
                    <h1>About Gopher X Metro Bus</h1>
                    {/* <!-- <p class="lead">A Social Coding Project made by: Adam, Ken, Riley, Will</p> --> */}
                    <p></p>
                    <p>The University of Minnesota has included the <a href="https://pts.umn.edu/Transit/Transit-Passes/Universal-Transit-Pass" target="_blank">transit pass</a> for students who pay the who pay the Transportation and Safety Fee. 
                        The transit pass allows students to have access to 
                        the city buses and Metro green and blue lines. 
                    </p>
                    <p> Made with Bootstrap v5.2.3</p>
                </div>
            </div>
            {/* <!-- Bootstrap core JS--> */}
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
            {/* <!-- Core theme JS--> */}
            <script src="js/scripts.js"></script>
        </>
    )
}

export default About;