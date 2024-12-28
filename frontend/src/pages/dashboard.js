import React from 'react';
import { useState, useEffect } from 'react';
import Dashboard from '../custom-components/Dashboard/Dashboard';
import { useAuth } from '../context/AuthContext';
const DashboardPage = () => {

    const URL = process.env.NODE_ENV === 'production'
        ? 'https://brawn-tedx.onrender.com'
        : 'http://localhost:4000';
    const [error, setError] = useState(null);
    const [body, setBody] = useState(null);
    const { user } = useAuth();

    const getUserdata = async() =>{
        try{
            const response = await fetch(`${URL}/api/user/getbodyinfo`,{
                method: 'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    username:user
                }),
                credentials:'include'
            });
            if (response.ok){
                const data = await response.json();
                setBody(data); 
            }
        }
        catch{
            setError("no information found");
        }
    }

    useEffect(() =>{
        if (user) getUserdata();
    }, [user]);
    return (
        <Dashboard MemberSince={body?.MemberSince || ""}/>
    );
};

export default DashboardPage;
