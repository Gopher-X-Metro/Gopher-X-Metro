import React from "react";
import "./styles.css";

function About({ hidden, setPage }) {
    const feedbackUrl = "https://github.com/KennedyJohnson/Gopher-X-Metro/issues";

    return (
        <div hidden={hidden} className="about-page">
            {/* <!-- Responsive navbar--> */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <button className="navbar-brand" onClick={() => setPage("map")}>Back to Map</button>
                </div>
            </nav>
            {/* <!-- Page content--> */}
            <div className="container">
                <div className="text-center mt-5">
                    <h1 className="title">About <strong>Gopher X Metro Bus</strong></h1>
                    <p className="highlight-text">The University of Minnesota has included the <a href="https://pts.umn.edu/transit/passes/universal-student-transit-pass" target="_blank" rel="noreferrer">transit pass</a> for students who pay the Transportation and Safety Fee (students can also opt in each semester). 
                        Your U Card works as the pass on Metro Transit buses and METRO lines, plus several suburban providers. 
                        The campus buses are free for everyone. 
                    </p>

                    {/* Feedback Section */}
                    <div className="feedback-section mt-4">
                        <h2><strong>Feedback</strong></h2>
                        <p>We would love to hear your thoughts! Report a bug or suggest a feature on <a href={feedbackUrl} target="_blank" rel="noreferrer" className="highlight-link">GitHub</a>.</p>
                    </div>

                    {/* FAQ Section */}
                    <div className="faq-section mt-5">
                        <h2 className="faq-title"><strong>Frequently Asked Questions</strong></h2>
                        <div className="faq-item">
                            <h4 className="question">1. What routes am I able to track?</h4>
                            <p className="answer">You can track the live location of every campus bus (routes 120–126), Metro Transit bus, and light rail train. Vehicle positions refresh every few seconds and stop departure times every thirty seconds. Buses whose location hasn't updated in over two minutes are faded out.</p>
                        </div>
                        <div className="faq-item">
                            <h4 className="question">2. How does the search function work?</h4>
                            <p className="answer">Search for a place with the search bar to drop a pin there and show the bus stops nearby. Tap any stop to see its upcoming departures.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4 className="question">3. Does this work outside of UMN?</h4>
                            <p className="answer">Yes! The Gopher-X-Metro Transit app works throughout the entire Twin Cities Metropolitan Area. Though we cater our app towards use on the UMN campus, the transit app is highly applicable for travel throughout the Twin Cities
                            </p>
                        </div>

                        <div className="faq-item">
                            <h4 className="question">4. Can I favorite specific routes?</h4>
                            <p className="answer">Yes, you can favorite stops. Open "Stops near me" and tap the star next to any stop. Your favorite stops and their next departures show up at the top of that panel every time you open the site. Favorites are saved in your browser.
                            </p>
                        </div>

                        <div className="faq-item">
                            <h4 className="question">5. How can I add routes that are not already on the Navigation Bar?</h4>
                            <p className="answer"> At the bottom of the routes menu (the ☰ button) there is a small search box. Enter any Metro Transit route number and it will appear on your map.
                            </p>
                        </div>

                        <div className="faq-item">
                            <h4 className="question">6. Can I see which stop my bus is heading to next?</h4>
                            <p className="answer"> Yes. Tap any bus or train on the map to see its route, direction, the next stop it is heading to, and how recently its location updated. For campus buses it also shows the estimated minutes to that stop. 
                            </p>
                        </div>
                        <br/>
                        <br/>

                    </div>
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
