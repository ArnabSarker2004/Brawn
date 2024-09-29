import './tailwind.css';
import './index.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';

import Routines from './pages/Routines';
import WorkoutPage from './pages/WorkoutPage';
import Brawnify from './pages/Brawnify';
import Navbar from './custom-components/Navbar';
import Brand from './custom-components/Brand';
import { WorkoutsContextProvider } from './context/WorkoutsContext';
import { SetsContextProvider } from './context/SetsContext';
import { RoutinesContextProvider } from './context/RoutinesContext';
import Dashboard from './pages/dashboard';
import Signup from './pages/signup';
import { Logout } from './components/ui/logout';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  // Display a loading state until we determine if the user is logged in or not
  
 
  console.log(localStorage.getItem('token'));

  return (
    <div className={`${isLoginPage ? "w-screen h-screen flex justify-center items-center" : "content"}`}>
      {/* Ensure Navbar and Brand always render if logged in */}
      {localStorage.getItem('token') && !isLoginPage && (
        <>
       
          <Navbar />
          <Brand />
          
        </>
      )}

      <div className={`${isLoginPage ? "w-full h-full" : "pages"}`}>
        <Routes>
          <Route path="/" element={<Signup  />} />
          <Route path="/routines" element={<PrivateRoute ><Routines /></PrivateRoute>} />
          <Route path="/routines/:routineId" element={<PrivateRoute ><WorkoutPage /></PrivateRoute>} />
          <Route path="/brawnify" element={<PrivateRoute ><Brawnify /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}




function PrivateRoute({ children}) {
  const token = localStorage.getItem('token'); 

  return ( token) ? (
    children
  ) : (
    <div className="whitespace-pre flex h-screen w-[100%] rounded-lg justify-center items-center p-2 text-center text-2xl font-bold">
      <Brand />
      <div className="overflow-hidden whitespace-pre">
        You need to be logged in to view this page. 
        <div>
          <Link to="/">Click here to login</Link>
        </div>
      </div>
    </div>
  );
}





function App() {
  

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      
    } else {
          }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <RoutinesContextProvider>
          <WorkoutsContextProvider>
            <SetsContextProvider>
              <AppContent  />
            </SetsContextProvider>
          </WorkoutsContextProvider>
        </RoutinesContextProvider>
      </BrowserRouter>
    </div>
  );
}


export default App;
