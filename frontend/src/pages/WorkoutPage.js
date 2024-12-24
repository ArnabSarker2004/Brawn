import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import WorkoutFormModal from '../custom-components/Modals/WorkoutFormModal';
import WorkoutDetails from '../custom-components/Workout/WorkoutDetails';
import { useWorkoutsContext } from '../hooks/useWorkoutsContext';

const Home = () => {
    const { workouts, dispatch: workoutsDispatch } = useWorkoutsContext();
    const [showModal, setShowModal] = useState(false);
    const [routineName, setRoutineName] = useState(''); 
    const { routineId } = useParams(); 
    const URL = process.env.NODE_ENV === 'production'
    ? 'https://brawn-tedx.onrender.com'
    : 'http://localhost:4000';
    
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
            <div className="fixed bottom-8 right-4 flex items-center space-x-2 cursor-pointer "  onClick={() => setShowModal(true)}>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brawn">
                    <span className="material-symbols-outlined text-white">add</span>
                </div>
                {!isMobile && <span className="text-gray-600 font-medium">Add Workout</span>}
            </div>

        </div>
    );
};

export default Home;
