
import { Logout } from '../../components/ui/logout';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasToken, setToken] = useState(false);

    useEffect(() =>{
        const token = localStorage.getItem('token');
        setToken(token); 
    }, []);

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
            <Link to="/analytics" className="navbar-item">
                <span className="material-symbols-outlined navbar-logo">analytics</span>
                {isExpanded && <span className="navbar-text">Analytics</span>}
            </Link>
            <Link to="/brawnify" className="navbar-item">
                <span className="material-symbols-outlined navbar-logo">robot_2</span>
                {isExpanded && <span className="navbar-text">Brawnify <sup>AI</sup></span>}
            </Link>
            {hasToken && <Logout isExpanded={isExpanded}/>}
            </div>
        </div>
        {isExpanded && <div className="overlay" onClick={toggleCollapse}></div>}
        </>
    );
};

export default Navbar;
