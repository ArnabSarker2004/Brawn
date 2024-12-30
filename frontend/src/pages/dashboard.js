import React from 'react';
import { useState, useEffect } from 'react';
import Dashboard from '../custom-components/Dashboard/Dashboard';
import { useAuth } from '../context/AuthContext';
const DashboardPage = () => {

    const URL = process.env.NODE_ENV === 'production'
        ? 'https://brawn-tedx.onrender.com'
        : 'http://localhost:4000';
    const [routines, setRoutines] = useState(null);
    const [weeklyWorkouts, setWeeklyWorkouts] = useState(null);
    const [body, setBody] = useState(null);
    const { user } = useAuth();

    const  getRoutineData = async () => {
        const response = await fetch(`${URL}/api/routines`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials:'include'
        });

        const routinesData = await response.json();
        if (response.ok) {
            setRoutines(routinesData);
        }
        else{
            console.error('Failed to fetch routines');
        }
    };
    
    const getWeeklyWorkouts = () => {
        const MaxDate = new Date();
        const MinDate = new Date();
        MinDate.setDate(MaxDate.getDate() - 7);
        let WeeklyWorkouts = [];

        routines.forEach((routine) => {
            const filteredStats = routine.completionStats.filter(stat => {
                const statDate = new Date(stat.date);
                return statDate >= MinDate && statDate <= MaxDate;
            });
            if (filteredStats.length > 0) {
                WeeklyWorkouts.push({ ...routine, completionStats: filteredStats });
            }
        });
        setWeeklyWorkouts(WeeklyWorkouts);
        return WeeklyWorkouts;
    };


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
        }
    }

    useEffect(() => {
        if (user) {
            getRoutineData();
            getUserdata();   
        }
    }, [user]);

    useEffect(() => {
        if (routines) {
            getWeeklyWorkouts(); 
        }
    }, [routines]);
    return (
        <Dashboard WeeklyWorkouts={weeklyWorkouts || []} TotalWorkouts={body?.TotalWorkouts || 0} MemberSince={body?.MemberSince || ""} LongestWorkoutStreak={body?.LongestWorkoutStreak || ""}/>
    );
};

export default DashboardPage;
