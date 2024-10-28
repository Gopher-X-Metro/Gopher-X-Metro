import React, { useEffect } from 'react';

import { BrowserRouter } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useMediaQuery } from '@chakra-ui/react';

import Pages from './frontend/Pages/Pages.tsx';

import "./styles.css";

export default function App() {
  // Check if screen width is 1024px or less (common mobile size and before buttons are cutoff by title)
  const [isMobile] = useMediaQuery("(max-width: 1024px)");

  useEffect(() => {
    if (isMobile)
      document.body.className = document.body.className + " mobile";
    else
      document.body.className = document.body.className.replace(" mobile", "");
  }, [isMobile])

  return (
    <APIProvider apiKey={process.env.REACT_APP_API_KEY} libraries={["places", "marker"]}>
      <BrowserRouter>
          <Pages isMobile={isMobile}/>
      </BrowserRouter>
    </APIProvider>
  );
}