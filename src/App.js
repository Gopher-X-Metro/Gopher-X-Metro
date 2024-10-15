import React from 'react';

import { BrowserRouter } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useMediaQuery } from '@chakra-ui/react';

import Pages from './frontend/Pages/Pages.tsx';

import "./styles.css";

export default function App() {
  // Check if screen width is 1024px or less (mobile)
  const [isMobile] = useMediaQuery("(max-width: 1024px)");

  return (
    <APIProvider apiKey={process.env.REACT_APP_API_KEY} libraries={["places", "marker"]}>
      <BrowserRouter>
          <Pages isMobile={isMobile}/>
      </BrowserRouter>
    </APIProvider>
  );
}