import { useTimer } from "../../context/TimerContext";
import Timer from "../Timer/Timer";

const TimerHeader = () =>{
    const {isRunning} = useTimer()
    return (
        <div className={!isRunning? "bg-gray-400 flex justify-center items-center align-middle py-1" : "flex justify-center items-center align-middle py-1 bg-red-500"}>
            <span className="text-white font-light">Workout in Progress:</span>
            <Timer/>
        </div>
    );
};

export default TimerHeader;