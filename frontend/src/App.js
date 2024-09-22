import './tailwind.css';
import './index.css';
// Import this after regular CSS so it does not get overwritten by the Tailwind base class
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Routines from './pages/Routines'; // Import Routines
import WorkoutPage from './pages/WorkoutPage'; // Import WorkoutPage for displaying workouts for a routine
import Brawnify from './pages/Brawnify'; // Import Brawnify
import Navbar from './Mcomponents/Navbar';
import Brand from './Mcomponents/Brand';
import { WorkoutsContextProvider } from './context/WorkoutsContext';
import { SetsContextProvider } from './context/SetsContext';
import { RoutinesContextProvider } from './context/RoutinesContext'; // Import RoutinesContextProvider

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        {/* Wrap the entire app with RoutinesContextProvider */}
        <RoutinesContextProvider>
          <WorkoutsContextProvider>
            <SetsContextProvider>
              <Navbar />
              <div className="content">
                <Brand />
                <div className="pages">
                  <Routes>
                    {/* Define routes here */}
                    <Route path="/routines" element={<Routines />} /> {/* Routines component renders here */}
                    <Route path="/routines/:routineId" element={<WorkoutPage />} /> {/* WorkoutPage component for specific routine */}
                    <Route path="/brawnify" element={<Brawnify />} /> {/* Brawnify component */}
                    {/* Add more routes as needed */}
                  </Routes>
                </div>
              </div>
            </SetsContextProvider>
          </WorkoutsContextProvider>
        </RoutinesContextProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
