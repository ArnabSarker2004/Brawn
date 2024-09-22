import './tailwind.css';
import './index.css';
 // we gotta import this after the regular css so the regular css does not get overwriten by the tailwind base class
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Routines from './pages/Routines'; // Import Routines
import Home from './pages/Home'; // Import Home for displaying workouts for a routine
import Navbar from './Mcomponents/Navbar';
import Brand from './Mcomponents/Brand';
import { WorkoutsContextProvider } from './context/WorkoutsContext';
import { SetsContextProvider } from './context/SetsContext';
import { RoutinesContextProvider } from './context/RoutinesContext'; // Import RoutinesContextProvider
import Dashboard from './pages/dashboard';

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
                    <Route path="/routines/:routineId" element={<Home />} /> {/* Home component for specific routine */}
                    <Route path = "/dashboard" element = {<Dashboard/>}/>
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
