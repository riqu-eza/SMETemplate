/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from 'react';
import { getTenantDomain } from '../utils/getTenantDomain';

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const tenantDomain = getTenantDomain();
  const [tenantData, setTenantData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/tenant/${tenantDomain}/metadata`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setTenantData(data);
      } catch (err) {
        console.error('Error fetching tenant data:', err);
      }
    })();
  }, [tenantDomain]);

  return (
    <TenantContext.Provider value={{ tenantDomain, tenantData }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
