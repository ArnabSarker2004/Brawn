// src/components/Brand.js
import React from 'react';
import BrawnLogo from '../assets/Brawn_Logo.png'; // Import the logo

const Brand = () => {
  return (
    <div className="brand-container">
      <img src={BrawnLogo} alt="Brawn Logo" /> {}
      <h1>Brawn</h1>
    </div>
  );
};

export default Brand;

