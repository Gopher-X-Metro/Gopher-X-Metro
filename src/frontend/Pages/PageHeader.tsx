import React from "react";

import "./Schedule/schedules.css";

/**
 * Maroon header shared by the pages behind the map, with a way back to it
 */
export default function PageHeader({ title, setPage, children }: { title: string, setPage: (page: string) => void, children?: React.ReactNode }) {
    return (
        <header className="page-header">
            <button className="page-back" onClick={() => setPage("map")} aria-label="Back to the map">
                <span aria-hidden="true">←</span> Map
            </button>
            <h1>{title}</h1>
            {children}
        </header>
    );
}
