import React from "react";
import { BrowserRouter } from "react-router-dom";
import { APIProvider } from "@vis.gl/react-google-maps";

import Pages from "src/frontend/Pages/Pages.tsx";

import "src/styles.css";

/**
 * Main component of application responsible for handling layout and API context
 * Detects screen size and adjusts the body's class based on mobile or desktop layout
 * 
 * @returns rendered application component.
 */
export default function App() {
  // Check if screen width is 1024px or less (common mobile size and before buttons are cutoff by title)

  return (
    <APIProvider apiKey={process.env.REACT_APP_API_KEY} libraries={["places", "marker"]}>
      <BrowserRouter>
          <Pages />
      </BrowserRouter>
    </APIProvider>
  );
}