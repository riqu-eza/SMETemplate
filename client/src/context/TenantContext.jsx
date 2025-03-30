/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
// TenantContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const [tenantData, setTenantData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/metadata`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setTenantData(data);
        console.log("Fetched Tenant Data:", data); // Debug line
      } catch (err) {
        console.error('Error fetching tenant data:', err);
      }
    })();
  }, []);

  return (
    <TenantContext.Provider value={{ tenantData, setTenantData }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
