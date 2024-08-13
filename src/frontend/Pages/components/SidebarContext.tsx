import React, { createContext, useContext, useState, ReactNode } from 'react';

// Create a context for the sidebar
interface SidebarContextType {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Create a provider component
export const SidebarProvider = ({ children }: { children: ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
            {children}
        </SidebarContext.Provider>
    );
};

// Custom hook to use the SidebarContext
export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};
