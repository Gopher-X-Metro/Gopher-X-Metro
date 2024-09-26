import React from "react";

import "./styles.css";

function About({ hidden, setPage }) {
    return (
        <div hidden={hidden}>
            {/* <!-- Responsive navbar--> */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <button className="navbar-brand" onClick={() => setPage("map")}>Back to Map</button>
                </div>
            </nav>
            {/* <!-- Page content--> */}
            <div className="container">
                <div className="text-center mt-5">
                    <h1>About Gopher X Metro Bus</h1>
                    {/* <!-- <p class="lead">A Social Coding Project made by: Adam, Ken, Riley, Will</p> --> */}
                    <p></p>
                    <p>The University of Minnesota has included the <a href="https://pts.umn.edu/Transit/Transit-Passes/Universal-Transit-Pass" target="_blank" rel="noreferrer">transit pass</a> for students who pay the who pay the Transportation and Safety Fee. 
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
        </div>
    )
}

export default About;