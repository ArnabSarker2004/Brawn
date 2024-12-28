import { useTimer } from "../../context/TimerContext";
import '../Modals/modal.css';
const Timer = () =>{
    const {timer} = useTimer();
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
            </div>
    );

}
export default Timer;