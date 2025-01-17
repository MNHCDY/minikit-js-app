"use client"; // Ensure this is a client component

import { createContext, useContext, useState } from "react";

interface FooterContextType {
  hideFooter: boolean;
  setHideFooter: (value: boolean) => void;
}

const FooterContext = createContext<FooterContextType | undefined>(undefined);

export const FooterProvider = ({ children }: { children: React.ReactNode }) => {
  const [hideFooter, setHideFooter] = useState(false);

  return (
    <FooterContext.Provider value={{ hideFooter, setHideFooter }}>
      {children}
    </FooterContext.Provider>
  );
};

export const useFooterContext = () => {
  const context = useContext(FooterContext);
  if (!context) {
    throw new Error("useFooterContext must be used within a FooterProvider");
  }
  return context;
};
