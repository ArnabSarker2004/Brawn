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


function AppContent() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
     const token = localStorage.getItem('token');
  
  if (!token) {
    setLoggedInUser(null);
  }
}, []);

  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  return (
    <div className={`${isLoginPage ? "w-screen h-screen flex justify-center items-center" : "content"}`}>
      {localStorage.getItem('token') && !isLoginPage && (
        <>
       
          <Navbar />
          <Brand />
          
        </>
      )}

      <div className={`${isLoginPage ? "w-full h-full" : "pages"}`}>
        <Routes>
          <Route path="/" element={<Signup setLoggedInUser = {setLoggedInUser}  />} />
          <Route path="/routines" element={<PrivateRoute ><Routines /></PrivateRoute>} />
          <Route path="/routines/:routineId" element={<PrivateRoute ><WorkoutPage /></PrivateRoute>} />
          <Route path="/brawnify" element={<PrivateRoute ><Brawnify /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}




function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');

  return token ? (
    children
  ) : (
    <div className="flex no-scrollbar flex-col justify-center items-center h-screen w-full p-4 text-center text-2xl font-bold">
      <Brand />
      <div className="mt-4 no-scrollbar">
        <p>You need to be logged in to view this page.</p>
        <Link to="/" className="mt-2 text-black underline no-scrollbar">
          Click here to login
        </Link>
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
