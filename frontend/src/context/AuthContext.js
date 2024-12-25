import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const AuthContext = React.createContext();

export const AuthProvider = ({children}) =>{
    let [isAuthenticated, setAuthentication] = useState(false);
    const[user, setUser] = useState(null);
    const[isLoading, setLoading] = useState(false);
    const navigate = useNavigate();
    const URL = process.env.NODE_ENV === 'production'
    ? 'https://brawn-tedx.onrender.com'
    : 'http://localhost:4000'; 

    const verify= () =>{
        setLoading(true);
        try{
            axios.get(`${URL}/api/auth/verify`, {withCredentials:true})
            .then ((res) =>{
                setAuthentication(res.data.isAuthenticated);
            })
            .catch(()=>{
                setAuthentication(false);
            });
        }finally{
            setLoading(false);
        }
    };

    useEffect(() =>{
        verify();
    })

    const logout = async () =>{
        await axios.post(`${URL}/api/auth/logout`, {withCredentials:true})
        navigate('/');
        setAuthentication(false);
        setUser(null);
    }
    const login = (userData) =>{
        setUser(userData);
    }

    return(
        <AuthContext.Provider value={{isAuthenticated, logout, verify, isLoading, login, user}}>
            {children}
        </AuthContext.Provider>
    );
} 

export const useAuth = () =>{
    return React.useContext(AuthContext);
}
