import { useContext } from "react";
import React from "react";
import { useState, useRef } from "react";
const TimerContext = React.createContext();

export const TimerProvider = ({ children }) => {
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timeInterval = useRef(null);
    const [completed, isCompleted] = useState(true);

    const handleStart = () => {
        if (isRunning) return;
        setIsRunning(true);
        isCompleted(false);
        timeInterval.current = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);
    };

    const handlePause = () => {
        if (!isRunning) return;
        setIsRunning(false);
        isCompleted(false);
        clearInterval(timeInterval.current);
    };

    const handleComplete = () => {
        setIsRunning(false);
        isCompleted(true);
        clearInterval(timeInterval.current);
        setTimer(0);
    };
    return (
        <TimerContext.Provider
            value={{
                isRunning,
                timer,
                handleStart,
                handlePause,
                handleComplete,
                completed,
            }}
        >
            {children}
        </TimerContext.Provider>
    );
};
export const useTimer = () => {
    return useContext(TimerContext);
};
