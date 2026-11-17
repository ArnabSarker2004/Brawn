import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
export function Logout({ isExpanded = true }) {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
    };
    return (
        <button
            onClick={handleLogout}
            className="navbar-item logout-item"
            type="button"
        >
            <LogOut className="navbar-logo" />
            {isExpanded && <span className="navbar-text">Logout</span>}
        </button>
    );
}
