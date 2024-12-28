import Timer from "../Timer/Timer";

const TimerHeader = () =>{
    return (
        <div className="flex justify-center items-center align-middle py-1 bg-red-500">
            <span className="text-white font-light">Workout in Progress:</span>
            <Timer/>
        </div>
    );
};

export default TimerHeader;