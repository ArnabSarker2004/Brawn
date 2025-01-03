import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
export function Logout({ isExpanded }) {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
    };
    return (
        <Link
            onClick={handleLogout}
            className="navbar-item absolute bottom-0 w-full"
        >
            <span className="material-symbols-outlined navbar-logo">
                logout
            </span>
            {isExpanded && <span className="navbar-text">Logout</span>}
        </Link>
    );
}
