import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const AuthContext = React.createContext();

export const AuthProvider = ({children}) =>{
    const[isAuthenticated, setAuthentication] = useState(false);
    const[isLoading, setLoading] = useState(false);
    const navigate = useNavigate();

    const verify= () =>{
        setLoading(true);
        try{
            axios.get('api/auth/verify', {withCredentials:true})
            .then ((res) =>{
                setAuthentication(res.data.isAuthenticated);
            })
            .catch(()=>{
                setAuthentication(false);
            });
        }catch{
            setAuthentication(false);
        }finally{
            setLoading(false);
        }
    };

    useEffect(() =>{
        verify();
    })

    const logout = async () =>{
        await axios.post('api/auth/logout', {withCredentials:true})
        navigate('/');
        setAuthentication(false);
        
    }

    return(
        <AuthContext.Provider value={{isAuthenticated, logout, verify, isLoading}}>
            {children}
        </AuthContext.Provider>
    );
} 

export const useAuth = () =>{
    return React.useContext(AuthContext);
}
