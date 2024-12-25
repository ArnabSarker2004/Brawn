import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoutinesContextProvider } from './context/RoutinesContext';
import { SetsContextProvider } from './context/SetsContext';
import { WorkoutsContextProvider } from './context/WorkoutsContext';
import Brand from './custom-components/Headers/Brand';
import Navbar from './custom-components/Navigation/Navbar';
import './index.css';
import Brawnify from './pages/Brawnify';
import Dashboard from './pages/dashboard';
import Profile from './pages/profile';
import Routines from './pages/Routines';
import Signup from './pages/signup';
import WorkoutPage from './pages/WorkoutPage';
import './tailwind.css';


const AppContent = () => {
    const {isAuthenticated} = useAuth();
    const location = useLocation();
    const isLoginPage = location.pathname === '/';
    return (
        <div className={`${isLoginPage ? "w-screen h-screen flex justify-center items-center" : "content"}`}>
        {isAuthenticated && !isLoginPage && (
            <>
        
            <Navbar />
            <Brand />
            
            </>
        )}

        <div className={`${isLoginPage ? "w-full h-full" : "pages"}`}>
            <Routes>
            <Route path="/" element={<Signup/>} />
            <Route path="/routines" element={<PrivateRoute ><Routines /></PrivateRoute>} />
            <Route path="/routines/:routineId" element={<PrivateRoute ><WorkoutPage /></PrivateRoute>} />
            <Route path="/brawnify" element={<PrivateRoute ><Brawnify /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path='/profile' element={<PrivateRoute><Profile/></PrivateRoute>}/>
            </Routes>
        </div>
        </div>
    );
}




function PrivateRoute({ children }) {
    const {isAuthenticated} = useAuth();
    
    return isAuthenticated ? (
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
    return (
        <div className="App">
        <BrowserRouter>
            <AuthProvider>
            <RoutinesContextProvider>
            <WorkoutsContextProvider>
                <SetsContextProvider>
                <AppContent  />
                </SetsContextProvider>
            </WorkoutsContextProvider>
            </RoutinesContextProvider>
            </AuthProvider>
        </BrowserRouter>
        </div>
    );
}


export default App;
