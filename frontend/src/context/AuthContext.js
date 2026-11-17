import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setAuthentication] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const navigate = useNavigate();
    const URL =
        process.env.NODE_ENV === "production"
            ? "https://brawn-tedx.onrender.com"
            : "http://localhost:4000";

    const verify = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${URL}/api/auth/verify`, {
                withCredentials: true,
            });
            const authenticated = Boolean(res.data.isAuthenticated);
            setAuthentication(authenticated);
            return authenticated;
        } catch {
            setAuthentication(false);
            setUser(null);
            return false;
        } finally {
            setLoading(false);
        }
    }, [URL]);

    useEffect(() => {
        verify();
    }, [verify]);

    const logout = async () => {
        try {
            await axios.post(`${URL}/api/auth/logout`, {}, { withCredentials: true });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                console.warn("Logout request failed; clearing local session anyway.", error);
            }
        } finally {
            setAuthentication(false);
            setUser(null);
            navigate("/", { replace: true });
        }
    };

    const login = (username) => {
        setAuthentication(true);
        setUser(username);
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, logout, verify, isLoading, login, user }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return React.useContext(AuthContext);
};
