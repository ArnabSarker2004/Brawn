import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '../components/ui/dropdown-menu';
import WorkoutFormModal from '../custom-components/Modals/WorkoutFormModal';
import WorkoutDetails from '../custom-components/Workout/WorkoutDetails';
import { useWorkoutsContext } from '../hooks/useWorkoutsContext';
import { useTimer } from '../context/TimerContext';
const Home = () => {
    const { workouts, dispatch: workoutsDispatch } = useWorkoutsContext();
    const [showModal, setShowModal] = useState(false);
    const [routineName, setRoutineName] = useState(''); 
    const { routineId } = useParams(); 
    const URL = process.env.NODE_ENV === 'production'
    ? 'https://brawn-tedx.onrender.com'
    : 'http://localhost:4000';
    const {handleStart, handlePause, isRunning, handleComplete, timer}= useTimer();
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    useEffect(() => {
        const fetchRoutineDetails = async () => {
        const response = await fetch(`${URL}/api/routines/${routineId}`,
            { method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials:'include'
            }
        );
        const data = await response.json();

        if (response.ok) {
            setRoutineName(data.name); 
        }
        };

        const fetchWorkouts = async () => {
            const response = await fetch(`${URL}/api/routines/${routineId}/workouts`,
                { method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials:'include'
                }
            );
            const data = await response.json();

            if (response.ok) {
                workoutsDispatch({ type: 'SET_WORKOUTS', payload: data });
            }
            };

            fetchRoutineDetails(); 
            fetchWorkouts(); 
        }, [URL,routineId, workoutsDispatch]);

        const handleCompleteWorkout = async () =>{

            const sendRoutineDetails = async() =>{

                const response = await fetch(`${URL}/api/routines/${routineId}/complete`,
                    {
                        method:'POST',
                        headers:{
                            'Content-Type': 'application/json',
                        },
                        credentials:'include',
                        body: JSON.stringify({"value":timer})
                    }
                );
                response.ok ? console.log("timer stopped") : console.log("timer ended");
            }
            await sendRoutineDetails();

            handleComplete();
        }

    return (
        <div>      
            <div className="home">
                <div className="Workout-Title">
                    <h1>{routineName}</h1> 
                </div>
                {showModal && <WorkoutFormModal setShowModal={setShowModal} routineId={routineId} />}
                <div className="workout-grid">
                    {workouts && workouts.map((workout) => (
                    <WorkoutDetails key={workout._id} workout={workout} routineId={routineId} />
                    ))}
                </div>
            </div>
            <div className="fixed bottom-8 right-4 flex items-center cursor-pointer rounded-full overflow-hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <div className="flex items-center cursor-pointer">
                            <span className="material-symbols-outlined text-white flex items-center justify-center w-12 h-12 rounded-full bg-brawn">
                                fitness_center
                            </span>
                            {!isMobile && (
                                <span className="text-gray-600 ml-2 font-medium text-lg">
                                    Actions
                                </span>
                            )}
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mr-3">
                        {!isRunning &&  <DropdownMenuItem className="cursor-pointer"onClick={() =>handleStart()}>
                            <span className="material-symbols-outlined text-brawn items-center justify-center">
                                play_arrow
                            </span>
                            Start Workout
                        </DropdownMenuItem>}
                        {isRunning &&  <DropdownMenuItem className="cursor-pointer" onClick={() =>handlePause()}>
                            <span className="material-symbols-outlined text-brawn items-center justify-center">
                                pause
                            </span>
                            Pause Workout
                        </DropdownMenuItem>}
                        <DropdownMenuItem className="cursor-pointer" onClick={() =>{handleCompleteWorkout();}}>
                            <span className="material-symbols-outlined text-brawn items-center justify-center">
                                flag_check
                            </span>
                            Complete Workout
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => setShowModal(true)}>
                            <span className="material-symbols-outlined text-brawn items-center justify-center">
                                add
                            </span>
                            Add Workout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default Home;
