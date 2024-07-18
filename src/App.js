import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import Pages from './frontend/Pages/Pages.tsx';
import NavBar from './frontend/NavBar/NavBar.tsx';

import "./styles.css"

export default function App() {
  return (
    <BrowserRouter>
      <html>
        <NavBar />
        <Pages />
      </html>
    </BrowserRouter>
  );
}
