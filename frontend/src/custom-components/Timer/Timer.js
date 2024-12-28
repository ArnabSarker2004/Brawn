import { useRef, useState } from "react";
import {Button} from "../../components/ui/button";
import '../Modals/modal.css'  
const Timer = () =>{
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timeInterval = useRef(null);

    const handleStart = () =>{
        if (isRunning) return;
        setIsRunning(true);
        timeInterval.current = setInterval(()=>{
            setTimer((prev) => prev+1);
        }, 1000);
    };

    const handlePause = () =>{
        if (!isRunning) return 
        setIsRunning(false);
        clearInterval(timeInterval.current);
    }

    const handleReset = () =>{
        if (!isRunning) return;
        setIsRunning(false);
        clearInterval(timeInterval.current);
        setTimer(0);
    }

    const formatTime = (timer) => {
        const hours = Math.floor(timer / 3600).toString().padStart(2, "0");
        const minutes = Math.floor((timer%3600) / 60).toString().padStart(2, "0");
        const seconds = (timer % 60).toString().padStart(2, "0");
        return { minutes, seconds, hours };
    };

    const { minutes, seconds, hours } = formatTime(timer);
    return (
            <div className=" flex flex-row text-white font-light mx-3 items-center">
                <div className="flex flex-row items-center">
                    <span>{hours}</span>
                    <span className="">:</span>
                    <span>{minutes}</span>
                    <span className="">:</span>
                    <span>{seconds}</span>
                </div>
                {/* <div className="modal-buttons">
                    <Button variant="default" onClick={handleStart}>Start</Button>
                    <Button onClick={handlePause}>Pause</Button>
                    <Button onClick={handleReset}>Reset</Button>
                </div> */}
            </div>
    );

}
export default Timer;