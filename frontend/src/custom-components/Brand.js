import React, { useState, useEffect } from 'react';
import BrawnLogo from '../assets/Brawn_Logo.png'; // Import the logo
import { Logout } from '../components/ui/logout';

const Brand = () => {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setHasToken(!!token);  
  }, []);

  return (
    <div className="brand-container">
      <img src={BrawnLogo} alt="Brawn Logo" /> 
      <h1 className="text-xl font-bold">Brawn</h1>
      {hasToken && (
        <div className="absolute right-4 top-4">
          <Logout />
        </div>
      )}
    </div>
  );
};

export default Brand;
