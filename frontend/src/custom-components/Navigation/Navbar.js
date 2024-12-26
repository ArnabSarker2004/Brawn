
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logout } from '../../components/ui/logout';
import { useAuth } from '../../context/AuthContext';
import './navigation.css';

const Navbar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const currentURL = window.location.href;
    const isRoutines = currentURL.includes('routines/')
    const {isAuthenticated} = useAuth();
    
    const toggleCollapse = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <>
        <div className={`navbar ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <button onClick={toggleCollapse} className="navbar-toggle-btn">
                <span className="material-symbols-outlined">
                    {isExpanded ? 'collapse_content' : 'expand_content'}
                </span>
            </button>
            <div className="navbar-content ">
                <Link to="/dashboard" className="navbar-item">
                    <span className="material-symbols-outlined navbar-logo">dashboard</span>
                    {isExpanded && <span className="navbar-text ">Dashboard</span>}
                </Link>
                <Link to="/routines" className="navbar-item">
                    <span className="material-symbols-outlined navbar-logo">exercise</span>
                    {isExpanded && <span className="navbar-text">Workout Routines</span>}
                </Link>
                <Link to="/brawnify" className="navbar-item">
                    <span className="material-symbols-outlined navbar-logo">robot_2</span>
                    {isExpanded && <span className="navbar-text">Brawnify <sup>AI</sup></span>}
                </Link>
                {isAuthenticated && <Logout isExpanded={isExpanded}/>}
                {isAuthenticated &&
                <Link to="/profile" className='navbar-item'>
                    <span className='material-symbols-outlined navbar-logo'>person</span>
                    {isExpanded && <span className='navbar-text'>Profile</span>}
                </Link>}
                {isRoutines && <Link to="/routines" className='navbar-item'>
                    <span className='material-symbols-outlined navbar-logo'>
                        keyboard_backspace
                    </span>
                    {isExpanded && <span className='navbar-text'>Back</span>}
                </Link>}
            </div>
        </div>
            {isExpanded && <div className="overlay" onClick={toggleCollapse}></div>}
        </>
    );
};

export default Navbar;
