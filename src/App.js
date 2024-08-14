import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import Pages from './frontend/Pages/Pages.tsx';
import NavBar from './frontend/NavBar/NavBar.tsx';
import { SidebarProvider } from './/frontend/Pages/components/SidebarContext.tsx'; 
import "./styles.css";

export default function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <ConditionalNavBar />
        <Pages />
      </SidebarProvider>
    </BrowserRouter>
  );
}

//Conditionally render the NavBar
function ConditionalNavBar() {
  const location = useLocation();
  //checks if currently in Schedules
  const isSchedulesPage = location.pathname === '/schedules';

  //Render NavBar only if not on the schedules page
  return !isSchedulesPage ? <NavBar /> : null;
}