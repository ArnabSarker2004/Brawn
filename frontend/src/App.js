import './tailwind.css';
import './index.css';
// Import this after regular CSS so it does not get overwritten by the Tailwind base class
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Routines from './pages/Routines'; // Import Routines
import WorkoutPage from './pages/WorkoutPage'; // Import WorkoutPage for displaying workouts for a routine
import Brawnify from './pages/Brawnify'; // Import Brawnify
import Navbar from './custom-components/Navbar';
import Brand from './custom-components/Brand';
import { WorkoutsContextProvider } from './context/WorkoutsContext';
import { SetsContextProvider } from './context/SetsContext';
import { RoutinesContextProvider } from './context/RoutinesContext'; 
import Dashboard from './pages/dashboard';
import Signup from './pages/signup'; 

function AppContent() {
  const location = useLocation(); // Get the current route

  const isSignupPage = location.pathname === '/signup'; // Check if the current route is the signup page

  return (
    <div className={`${isSignupPage ? "w-screen h-screen flex justify-center items-center" : "content"}`}>
      {/* Conditionally render Navbar and Brand if not on signup page */}
      {!isSignupPage && (
        <>
          <Navbar />
          <Brand />
        </>
      )}
      <div className={`${isSignupPage ? "w-full h-full" : "pages"}`}>
        <Routes>
          {/* Define routes here */}
          <Route path="/routines" element={<Routines />} /> {/* Routines component renders here */}
          <Route path="/routines/:routineId" element={<WorkoutPage />} /> {/* WorkoutPage component for specific routine */}
          <Route path="/brawnify" element={<Brawnify />} /> {/* Brawnify component */}
          <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard component */}
          <Route path="/signup" element={<Signup />} /> {/* Signup component */}
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        {/* Wrap the entire app with RoutinesContextProvider */}
        <RoutinesContextProvider>
          <WorkoutsContextProvider>
            <SetsContextProvider>
              <AppContent />
            </SetsContextProvider>
          </WorkoutsContextProvider>
        </RoutinesContextProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
