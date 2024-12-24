import axios from "axios";
import React, { useEffect, useState } from "react";
const AuthContext = React.createContext();

export const AuthProvider = ({children}) =>{
    const[isAuthenticated, setAuthentication] = useState(false);

    useEffect(() =>{
        axios.get('api/auth/verify', {withCredentials:true})
            .then ((res) =>{
                setAuthentication(res.data.isAuthenticated);
            })
            .catch(()=>{
                setAuthentication(false);
            });
    }, []);

    return(
        <AuthContext.Provider value={{isAuthenticated}}>
            {children}
        </AuthContext.Provider>
    );
} 

export const useAuth = () =>{
    return React.useContext(AuthContext);
}