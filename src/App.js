import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import Pages from './frontend/Pages/Pages.tsx';
import NavBar from './frontend/NavBar/NavBar.tsx';

import {registerServiceWorkerOnLoad} from './backend/firebase/Notify.ts';

import "./styles.css"

export default function App() {
  registerServiceWorkerOnLoad();
  
  return (
    <BrowserRouter>
      <NavBar/>
      <Pages/>
    </BrowserRouter>
  );
}
