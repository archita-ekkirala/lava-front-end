import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [selection, setSelection] = useState(null);

  return (
    <AppContext.Provider value={{ activePage, setActivePage, selection, setSelection }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);