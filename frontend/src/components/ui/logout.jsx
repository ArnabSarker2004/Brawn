import { Link, useNavigate } from "react-router-dom";

export function Logout({isExpanded}) {

const navigate = useNavigate();
const handleLogout = () =>{
    localStorage.removeItem('token');
    navigate('/');
}
return (
    (<Link onClick = {handleLogout} className="navbar-item">
        <span className="material-symbols-outlined navbar-logo">
            logout
        </span>
        {isExpanded && <span className="navbar-text">
            Logout
        </span>}
    </Link>)
);
}
