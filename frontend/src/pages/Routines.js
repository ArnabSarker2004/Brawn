import React, { useState, useEffect } from 'react';
import Routine from '../custom-components/Workout/Routine';
import RoutineFormModal from '../custom-components/Modals/RoutineFormModal'; 
import { useRoutinesContext } from '../hooks/useRoutinesContext';
import {Button} from '../components/ui/button';
import {useWorkoutsContext} from '../hooks/useWorkoutsContext';
import { useParams } from 'react-router-dom';
const Routines = () => {
    const token = localStorage.getItem('token');
    const { routines, dispatch } = useRoutinesContext();
    const {workouts, workoutDispatch} = useWorkoutsContext();
    const [showAddModal, setShowAddModal] = useState(false);
    const {routineId} = useParams();
    
    useEffect(() =>{
        const fetchWorkouts = async () => {
        const response = await fetch(`/api/routines/${routineId}/workouts`,
            { method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`}
            }
        );
        const data = await response.json();

        if (response.ok) {
            workoutDispatch({ type: 'SET_WORKOUTS', payload: data });
        }
        };
        fetchWorkouts();
    }, [workoutDispatch]);

    useEffect(() => {
        const fetchRoutines = async () => {
        const response = await fetch('/api/routines',
            { method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`}
            }
        );

        const data = await response.json();

        if (response.ok) {
            dispatch({ type: 'SET_ROUTINES', payload: data });
        } else {
            console.error('Failed to fetch routines');
        }
    };
        fetchRoutines();
    }, [dispatch]);

    const handleDeleteRoutine = async (id) => {
        const response = await fetch(`/api/routines/${id}`, { 
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
                <Button variant="default" className= "w-full text-lg mb-4" onClick={() => setShowAddModal(true)}>
                    Add Routine
                </Button>
            </div>
            <div className="routine-list">
                {routines && routines.map((routine) => (
                <Routine
                    workouts={workouts}
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
