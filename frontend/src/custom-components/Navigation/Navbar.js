import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    ArrowLeft,
    Bot,
    Clapperboard,
    Compass,
    Dumbbell,
    Home,
    Mail,
    PlusSquare,
    UserRound,
} from "lucide-react";
import GlassSurface from "../ReactBits/GlassSurface";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import "./navigation.css";

const navItems = [
    { to: "/dashboard", label: "Home", icon: Home },
    { to: "/discover", label: "Discover", icon: Compass },
    { to: "/messages", label: "Messages", icon: Mail },
    { to: "/routines", label: "Routines", icon: Dumbbell },
    { to: "/reels", label: "Reels", icon: Clapperboard },
    { to: "/brawnify", label: "Brawnify", icon: Bot },
    { to: "/profile", label: "Profile", icon: UserRound },
];

const Navbar = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const isRoutinesDetail = location.pathname.includes("/routines/");
    const visibleNavItems = navItems.filter(({ label }) => label !== "Profile" || isAuthenticated);
    const isCreatePage = location.pathname === "/create";
    const activeNavIndex = visibleNavItems.findIndex(({ to }) => (
        location.pathname === to ||
        (to === "/routines" && location.pathname.startsWith("/routines"))
    ));
    const activeDockIndex = isCreatePage ? 0 : activeNavIndex >= 0 ? activeNavIndex + 1 : -1;
    const [navTheme, setNavTheme] = useState(() => {
        if (typeof window === "undefined") return "light";
        return window.localStorage.getItem("brawn-home-theme") === "dark" ? "dark" : "light";
    });

    useEffect(() => {
        const syncTheme = () => {
            setNavTheme(window.localStorage.getItem("brawn-home-theme") === "dark" ? "dark" : "light");
        };

        window.addEventListener("storage", syncTheme);
        window.addEventListener("brawn-theme-change", syncTheme);
        syncTheme();

        return () => {
            window.removeEventListener("storage", syncTheme);
            window.removeEventListener("brawn-theme-change", syncTheme);
        };
    }, []);

    return (
        <aside
            className={`app-navbar app-navbar-${navTheme}`}
            aria-label="Primary navigation"
        >
            <nav
                className={cn("navbar-content", activeDockIndex >= 0 && "has-active-indicator")}
                style={{ "--navbar-active-index": String(activeDockIndex) }}
            >
                <GlassSurface
                    aria-hidden="true"
                    borderRadius={999}
                    backgroundOpacity={navTheme === "dark" ? 0.24 : 0.32}
                    blur={8}
                    brightness={navTheme === "dark" ? 42 : 62}
                    displace={0.5}
                    distortionScale={navTheme === "dark" ? -58 : -48}
                    saturation={1.58}
                    className="navbar-active-glass"
                    contentClassName="navbar-active-glass-content"
                />
                <Link
                    to="/create"
                    className={cn("navbar-item navbar-button navbar-create-item", isCreatePage && "active")}
                    aria-label="Create post"
                    title="Create"
                >
                    <PlusSquare className="navbar-logo" />
                    <span className="navbar-text">Create</span>
                </Link>
                {visibleNavItems.map(({ to, label, icon: Icon }) => {
                    const active =
                        location.pathname === to ||
                        (to === "/routines" && location.pathname.startsWith("/routines"));

                    return (
                        <Link
                            key={to}
                            to={to}
                            className={cn("navbar-item", active && "active")}
                            aria-label={label}
                            title={label}
                        >
                            <Icon className="navbar-logo" />
                            <span className="navbar-text">{label}</span>
                        </Link>
                    );
                })}

                {isRoutinesDetail && (
                    <Link to="/routines" className="navbar-item navbar-back-item" aria-label="Back to routines" title="Back">
                        <ArrowLeft className="navbar-logo" />
                        <span className="navbar-text">Back</span>
                    </Link>
                )}
            </nav>

        </aside>
    );
};

export default Navbar;
