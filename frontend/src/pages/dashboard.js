import React from "react";
import { useState, useEffect } from "react";
import Dashboard from "../custom-components/Dashboard/Dashboard";
import { useAuth } from "../context/AuthContext";
const DashboardPage = () => {
    const URL =
        process.env.NODE_ENV === "production"
            ? "https://brawn-tedx.onrender.com"
            : "http://localhost:4000";
    const [routineDistribution, setRoutineDistribution] = useState({
        weekly: [],
        monthly: []
    });
    const [routines, setRoutines] = useState(null);
    const [weeklyWorkouts, setWeeklyWorkouts] = useState(null);
    const [body, setBody] = useState(null);
    const [chartData, setChartData] = useState(null);
    const { user } = useAuth();

    const getRoutineData = async () => {
        const response = await fetch(`${URL}/api/routines`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        const routinesData = await response.json();
        if (response.ok) {
            setRoutines(routinesData);
        } else {
            console.error("Failed to fetch routines");
        }
    };

    const getWeeklyWorkouts = () => {
        const MaxDate = new Date();
        const MinDate = new Date();
        MinDate.setDate(MaxDate.getDate() - 7);
        let WeeklyWorkouts = [];

        routines.forEach((routine) => {
            const filteredStats = routine.completionStats.filter((stat) => {
                const statDate = new Date(stat.date);
                return statDate >= MinDate && statDate <= MaxDate;
            });
            if (filteredStats.length > 0) {
                WeeklyWorkouts.push({
                    ...routine,
                    completionStats: filteredStats,
                });
            }
        });
        setWeeklyWorkouts(WeeklyWorkouts);
        return WeeklyWorkouts;
    };

    const getUserdata = async () => {
        try {
            const response = await fetch(`${URL}/api/user/getbodyinfo`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: user,
                }),
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                setBody(data);
            }
        } catch {}
    };
    function graphData(routines) {
        let weeklyCardioTime = [0, 0, 0, 0];
        let weeklyStrengthTime = [0, 0, 0, 0];

        let routineCardioTimes = new Map();
        let routineStrengthTimes = new Map();

        routines.forEach((routine) => {
            let cardioTime = 0;
            let strengthTime = 0;

            routine.workouts.forEach((workout) => {
                const sumOfSets = workout.sets.reduce(
                    (acc, set) => acc + (set.time || 0),
                    0
                );
                if (workout.cardio === true) {
                    cardioTime += sumOfSets;
                } else {
                    strengthTime += sumOfSets;
                }
            });

            routineCardioTimes.set(routine._id, cardioTime);
            routineStrengthTimes.set(routine._id, strengthTime);
        });

        routines.forEach((routine) => {
            const thisRoutineCardio = routineCardioTimes.get(routine._id) || 0;
            const thisRoutineStrength =
                routineStrengthTimes.get(routine._id) || 0;

            routine.completionStats.forEach((stat) => {
                const statDate = new Date(stat.date);
                const dayOfMonth = statDate.getDate();
                let weekIndex = Math.floor((dayOfMonth - 1) / 7);
                weekIndex = Math.min(weekIndex, 3);

                const totalTime = stat.totalTime || 0;

                let cardioTime = thisRoutineCardio;
                let strengthTime;

                if (thisRoutineStrength === 0) {
                    strengthTime = Math.max(totalTime - cardioTime, 0);
                } else {
                    strengthTime = thisRoutineStrength;
                }

                weeklyCardioTime[weekIndex] += cardioTime;
                weeklyStrengthTime[weekIndex] += strengthTime;
            });
        });

        let totalCardioTime = 0;
        let totalStrengthTime = 0;

        routines.forEach((routine) => {
            const thisRoutineCardio = routineCardioTimes.get(routine._id) || 0;
            const thisRoutineStrength =
                routineStrengthTimes.get(routine._id) || 0;

            routine.completionStats.forEach((stat) => {
                const totalTime = stat.totalTime || 0;
                totalCardioTime += thisRoutineCardio;
                if (thisRoutineStrength === 0) {
                    totalStrengthTime += Math.max(
                        totalTime - thisRoutineCardio,
                        0
                    );
                } else {
                    totalStrengthTime += thisRoutineStrength;
                }
            });
        });

        weeklyCardioTime = weeklyCardioTime.map((val) => Math.floor(val / 60));
        weeklyStrengthTime = weeklyStrengthTime.map((val) => Math.floor(val / 60));
        totalCardioTime = Math.floor(totalCardioTime / 60);
        totalStrengthTime = Math.floor(totalStrengthTime / 60);

        console.log(
            "weeklyCardioTime:",
            weeklyCardioTime,
            "weeklyStrengthTime:",
            weeklyStrengthTime,
            "totalCardioTime:",
            totalCardioTime,
            "totalStrengthTime:",
            totalStrengthTime
        );
        setChartData({ weeklyCardioTime, weeklyStrengthTime });
    }

    const calculateRoutineDistribution = (routines) => {
        const now = new Date();
        const weekAgo = new Date(now);
        const monthAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        monthAgo.setDate(now.getDate() - 30);

        let weeklyRoutines = new Map();
        let monthlyRoutines = new Map();

        routines.forEach((routine) => {
            let routineTotalTime = 0;
            routine.workouts.forEach((workout) => {
                const workoutTime = workout.sets.reduce(
                    (acc, set) => acc + (set.time || 0),
                    0
                );
                routineTotalTime += workoutTime;
            });

            const weeklyStats = routine.completionStats.filter((stat) => {
                const statDate = new Date(stat.date);
                return statDate >= weekAgo && statDate <= now;
            });

            if (weeklyStats.length > 0) {
                const weeklyTime = Math.floor((routineTotalTime * weeklyStats.length) / 60);
                weeklyRoutines.set(routine.name, weeklyTime);
            }

            const monthlyStats = routine.completionStats.filter((stat) => {
                const statDate = new Date(stat.date);
                return statDate >= monthAgo && statDate <= now;
            });

            if (monthlyStats.length > 0) {
                const monthlyTime = Math.floor((routineTotalTime * monthlyStats.length) / 60);
                monthlyRoutines.set(routine.name, monthlyTime);
            }
        });

        const weeklyData = Array.from(weeklyRoutines, ([name, value]) => ({
            name,
            value
        }));

        const monthlyData = Array.from(monthlyRoutines, ([name, value]) => ({
            name,
            value
        }));

        setRoutineDistribution({
            weekly: weeklyData,
            monthly: monthlyData
        });
    };

    useEffect(() => {
        if (user) {
            getRoutineData();
            getUserdata();
        }
    }, [user]);

    useEffect(() => {
        if (routines) {
            getWeeklyWorkouts();
            graphData(routines);
            calculateRoutineDistribution(routines);
        }
    }, [routines]);

    return (
        <div className="overflow-y-hidden">
        <Dashboard
            CurrentWorkoutStreak ={body?.CurrentWorkoutStreak || 0}
            Weight={body?.Weight || 0}
            WeeklyWorkouts={weeklyWorkouts || []}
            TotalWorkouts={body?.TotalWorkouts || 0}
            MemberSince={body?.MemberSince || ""}
            LongestWorkoutStreak={body?.LongestWorkoutStreak || ""}
            user={user}
            chartData={chartData}
            routineDistribution={routineDistribution}
            routines={routines}
        />
        </div>
    );
};

export default DashboardPage;
