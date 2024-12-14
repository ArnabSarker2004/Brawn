import React, { useState, useEffect } from 'react';
import Routine from '../custom-components/Workout/Routine';
import RoutineFormModal from '../custom-components/Modals/RoutineFormModal'; 
import { useRoutinesContext } from '../hooks/useRoutinesContext';

const Routines = () => {
  const token = localStorage.getItem('token');
  const { routines, dispatch } = useRoutinesContext();
  const [showAddModal, setShowAddModal] = useState(false);

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
        <button className="add-routine-btn" onClick={() => setShowAddModal(true)}>Add Routine</button>
      </div>

      <div className="routine-list">
        {routines && routines.map((routine) => (
          <Routine
            key={routine._id}
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
