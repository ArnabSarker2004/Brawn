import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import RoutineFormModal from '../custom-components/Modals/RoutineFormModal';
import Routine from '../custom-components/Workout/Routine';
import { useRoutinesContext } from '../hooks/useRoutinesContext';
const Routines = () => {
    const token = localStorage.getItem('token');
    const { routines, dispatch } = useRoutinesContext();
    const [showAddModal, setShowAddModal] = useState(false);
    const URL = process.env.NODE_ENV === 'production'
    ? 'https://brawn-tedx.onrender.com'
    : 'http://localhost:4000';
    
    useEffect(() => {
        const fetchRoutinesWithWorkouts = async () => {
            const response = await fetch(`${URL}/api/routines`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const routinesData = await response.json();
                const routinesWithWorkouts = await Promise.all(
                    routinesData.map(async (routine) => {
                        const workoutsResponse = await fetch(`${URL}/api/routines/${routine._id}/workouts`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                            },
                        });

                        const workoutsData = workoutsResponse.ok ? await workoutsResponse.json() : [];
                        return { ...routine, workouts: workoutsData };
                    })
                );

                dispatch({ type: 'SET_ROUTINES', payload: routinesWithWorkouts });
            } else {
                console.error('Failed to fetch routines');
            }
        };

        fetchRoutinesWithWorkouts();
    }, [dispatch, token]);


    const handleDeleteRoutine = async (id) => {
        const response = await fetch(`${URL}/api/routines/${id}`, { 
            method: 'DELETE', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }  
        });

        if (response.ok) {
            const deletedRoutine = await response.json();
            dispatch({ type: 'DELETE_ROUTINE', payload: deletedRoutine });  
        } else {
            console.error('Failed to delete routine');
        }
    };

    return (

        <div className="routine-grid">
            <div className="add-routine-row">
                <Button variant="default" className= "w-full text-2xl mb-4" onClick={() => setShowAddModal(true)}>
                    Add Routine
                </Button>
            </div>
            <div className="routine-list">
                {routines && routines.map((routine) => (
                <Routine
                    workouts={routine.workouts}
                    routine={routine}
                    onDelete={handleDeleteRoutine} 
                />
                ))}
            </div>
            {showAddModal && <RoutineFormModal onClose={() => setShowAddModal(false)} />}
        </div>
    );
};

export default Routines;
