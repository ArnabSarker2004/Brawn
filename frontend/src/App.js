import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { Loader2, LockKeyhole } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoutinesContextProvider } from './context/RoutinesContext';
import { SetsContextProvider } from './context/SetsContext';
import { SocialPostsProvider } from './context/SocialPostsContext';
import { WorkoutsContextProvider } from './context/WorkoutsContext';
import Navbar from './custom-components/Navigation/Navbar';
import PostComposer from './custom-components/Social/PostComposer';
import './index.css';
import Brawnify from './pages/Brawnify';
import CreateStudio from './pages/CreateStudio';
import Dashboard from './pages/dashboard';
import Discover from './pages/Discover';
import Messages from './pages/Messages';
import Profile from './pages/profile';
import PublicProfile from './pages/PublicProfile';
import Reels from './pages/Reels';
import Routines from './pages/Routines';
import Signup from './pages/signup-login';
import WorkoutPage from './pages/WorkoutPage';
import './tailwind.css';
import { TimerProvider } from './context/TimerContext';

const appShellBackgrounds = {
    light: 'radial-gradient(circle at 3.25rem 50%, rgba(42, 142, 255, 0.14), transparent 18rem), radial-gradient(circle at 82% 0%, rgba(148, 163, 184, 0.12), transparent 28rem), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 46%, #ffffff 100%)',
    dark: 'radial-gradient(circle at 3.25rem 50%, rgba(42, 142, 255, 0.16), transparent 18rem), radial-gradient(circle at 82% 0%, rgba(148, 163, 184, 0.1), transparent 28rem), linear-gradient(180deg, #050506 0%, #0b0d11 54%, #06070a 100%)',
};

const AppContent = () => {
    const {isAuthenticated} = useAuth();
    const location = useLocation();
    const isLoginPage = location.pathname === '/';
    const isCreatePage = location.pathname === '/create';
    const isFullBleedPage =
        location.pathname === '/dashboard' ||
        location.pathname === '/brawnify' ||
        isCreatePage ||
        location.pathname === '/discover' ||
        location.pathname === '/reels';
    const [appTheme, setAppTheme] = useState(() => {
        if (typeof window === 'undefined') return 'light';
        return window.localStorage.getItem('brawn-home-theme') === 'dark' ? 'dark' : 'light';
    });

    useEffect(() => {
        const syncTheme = () => {
            setAppTheme(window.localStorage.getItem('brawn-home-theme') === 'dark' ? 'dark' : 'light');
        };

        window.addEventListener('storage', syncTheme);
        window.addEventListener('brawn-theme-change', syncTheme);
        syncTheme();

        return () => {
            window.removeEventListener('storage', syncTheme);
            window.removeEventListener('brawn-theme-change', syncTheme);
        };
    }, []);

    useEffect(() => {
        if (isLoginPage) {
            document.body.classList.remove('app-body-light', 'app-body-dark');
            document.body.style.background = '';
            document.documentElement.style.background = '';
            return;
        }

        const background = appShellBackgrounds[appTheme];
        document.body.classList.toggle('app-body-dark', appTheme === 'dark');
        document.body.classList.toggle('app-body-light', appTheme === 'light');
        document.body.style.background = background;
        document.documentElement.style.background = background;

        return () => {
            document.body.classList.remove('app-body-light', 'app-body-dark');
            document.body.style.background = '';
            document.documentElement.style.background = '';
        };
    }, [appTheme, isLoginPage]);

    return (
        <div
            className={isLoginPage ? "min-h-screen bg-background" : `app-shell app-shell-${appTheme} min-h-screen text-foreground`}
            style={isLoginPage ? undefined : { background: appShellBackgrounds[appTheme] }}
        >
        {isAuthenticated && !isLoginPage && (
            <Navbar />
        )}

        <main className={isLoginPage ? "min-h-screen" : `pages${isFullBleedPage ? " pages-full-bleed" : ""}${isCreatePage ? " pages-create-studio" : ""}`}>
            <Routes>
            <Route path="/" element={<Signup/>} />
            <Route path="/routines" element={<PrivateRoute ><Routines /></PrivateRoute>} />
            <Route path="/routines/:routineId" element={<PrivateRoute ><WorkoutPage /></PrivateRoute>} />
            <Route path="/brawnify" element={<PrivateRoute ><Brawnify /></PrivateRoute>} />
            <Route path="/create" element={<PrivateRoute><CreateStudio /></PrivateRoute>} />
            <Route path="/discover" element={<PrivateRoute><Discover /></PrivateRoute>} />
            <Route path="/reels" element={<PrivateRoute><Reels /></PrivateRoute>} />
            <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path='/profile' element={<PrivateRoute><Profile/></PrivateRoute>}/>
            <Route path='/profile/:handle' element={<PrivateRoute><PublicProfile/></PrivateRoute>}/>
            </Routes>
        </main>
        {isAuthenticated && !isLoginPage && <PostComposer />}
        </div>
    );
}

function PrivateRoute({ children }) {
    const {isAuthenticated, isLoading} = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
        );
    }
    
    return isAuthenticated ? (
        children
    ) : (
        <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <LockKeyhole className="h-7 w-7" />
            </div>
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Sign in required</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Your dashboard, routines, and body metrics are protected.
                </p>
            </div>
            <Link to="/" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90">
                Go to login
            </Link>
        </div>
    );
}

function App() {
    return (
        <div className="App">
        <BrowserRouter>
            <AuthProvider>
                <SocialPostsProvider>
                    <RoutinesContextProvider>
                        <TimerProvider>
                            <WorkoutsContextProvider>
                                <SetsContextProvider>
                                    <AppContent  />
                                </SetsContextProvider>
                            </WorkoutsContextProvider>
                        </TimerProvider>
                    </RoutinesContextProvider>
                </SocialPostsProvider>
            </AuthProvider>
        </BrowserRouter>
        </div>
    );
}


export default App;
