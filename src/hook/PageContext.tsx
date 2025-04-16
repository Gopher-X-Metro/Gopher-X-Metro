import React, { createContext, useContext, useState } from "react";

interface PageContextType {
    page: string;
    setPage: React.Dispatch<React.SetStateAction<string>>;
}

const PageContext = createContext<PageContextType>({
    page: "map",
    setPage: () => { }
});


export function PageProvider({ children }: { children: React.ReactNode }) {
    const [page, setPage] = useState<string>("map");

    return (
        <PageContext.Provider value={{ page, setPage }}>
            {children}
        </PageContext.Provider>
    );
}

export function usePageContext() {
    return useContext(PageContext);
}