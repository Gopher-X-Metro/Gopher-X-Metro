import React from "react";
import "./styles.css";

/**
 * About Page
 * 
 * Renders informational page to include information about benefits for our
 * target audience along with some helpful FAQs for the user to help
 * guide our application
 * 
 * @param hidden prop to hide page
 * @param setPage prop to set page
 * @returns rendered About Page
 */
function About({ hidden, setPage }) {
    const googleFormUrl = "https://forms.gle/o7cDFtZ65vhic9uD9";

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
                    <p className="highlight-text">The University of Minnesota has included 
                        the <a href="https://pts.umn.edu/Transit/Transit-Passes/Universal-Transit-Pass" target="_blank" rel="noreferrer" className="highlight-link">transit pass</a> for 
                        students who pay the Transportation and Safety Fee. 
                        The transit pass allows students to have access to 
                        the city buses and Metro green and blue lines.</p>

                    {/* Feedback Section */}
                    <div className="feedback-section mt-4">
                        <h2><strong>Feedback</strong></h2>
                        <p>We would love to hear your thoughts! Please provide your feedback using <a href={googleFormUrl} target="_blank" rel="noreferrer" className="highlight-link">this form</a>.</p>
                    </div>

                    {/* FAQ Section */}
                    <div className="faq-section mt-5">
                        <h2 className="faq-title"><strong>Frequently Asked Questions</strong></h2>
                        <div className="faq-item">
                            <h4 className="question">1. What routes am I able to track?</h4>
                            <p className="answer">You can track bus times and the current location of any Campus bus, Metro bus, or lightrail! Our statistics update every thirty seconds, making sure your information is always up to date.</p>
                        </div>
                        <div className="faq-item">
                            <h4 className="question">2. How does the search function work?</h4>
                            <p className="answer">By searching a specific location, you can find the nearest bus stops and see the buses that pass by that given location. From there, you can plan your route based on the available stops near the place you would like to go.</p>
                        </div>
                        <div className="faq-item">
                            <h4 className="question">3. Does this work outside of UMN?</h4>
                            <p className="answer">Yes! The Gopher-X-Metro Transit app works throughout the entire Twin Cities Metropolitan Area. Though we cater our app towards use on the UMN campus, the transit app is highly applicable for travel throughout the Twin Cities!</p>
                        </div>

                        <div className="faq-item">
                            <h4 className="question">4. Can I favorite specific routes?</h4>
                            <p className="answer">By hitting the star on the map, you can put any route you want into the favorites tab. This includes routes that are not automatically listed in the routes tab.</p>
                        </div>

                        <div className="faq-item">
                            <h4 className="question">5. How can I add routes that are not already on the Navigation Bar?</h4>
                            <p className="answer"> At the bottom of the routes tab, there is a small search bar. Search any route that goes through the Twin Cities Metropolitan Area and it will appear on your map!</p>
                        </div>

                        <div className="faq-item">
                            <h4 className="question">6. Can I see which stop my bus is heading to next?</h4>
                            <p className="answer"> You can see the next stop of your bus by tapping the bus icon for the bus you are currently riding. A popup will then appear with information including the next stop your bus is heading to.</p>
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
    );
}

export default About;