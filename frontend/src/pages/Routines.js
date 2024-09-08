import React, { useState, useEffect } from 'react';
import Routine from '../components/Routine';
import RoutineFormModal from '../components/RoutineFormModal';
import RoutineEditModal from '../components/RoutineEditModal';
import { useRoutinesContext } from '../hooks/useRoutinesContext';

const Routines = () => {
  const { routines, dispatch } = useRoutinesContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState(null);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const response = await fetch('/api/routines');
        const data = await response.json();

        if (response.ok) {
          dispatch({ type: 'SET_ROUTINES', payload: data });
        } else {
          console.error('Failed to fetch routines');
        }
      } catch (error) {
        console.error('Error fetching routines:', error);
      }
    };

    fetchRoutines();
  }, [dispatch]);

  const handleDeleteRoutine = async (id) => {
    try {
      const response = await fetch(`/api/routines/${id}`, { method: 'DELETE' });
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'DELETE_ROUTINE', payload: { _id: data } });
      } else {
        console.error('Failed to delete routine');
      }
    } catch (error) {
      console.error('Error deleting routine:', error);
    }
  };

  const handleEditRoutine = (routine) => {
    setCurrentRoutine(routine);
    setShowEditModal(true);
  };

  const handleEditRoutineSubmit = async (id, newName) => {
    try {
      const response = await fetch(`/api/routines/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (response.ok) {
        const updatedRoutine = await response.json();
        dispatch({ type: 'UPDATE_ROUTINE', payload: updatedRoutine });
        setShowEditModal(false);
      } else {
        console.error('Failed to edit routine');
      }
    } catch (error) {
      console.error('Error editing routine:', error);
    }
  };

  return (
    <div className="routine-grid">
      <div className="add-routine-row">
        <button className="add-routine-btn" onClick={() => setShowAddModal(true)}>
          Add Routine
        </button>
      </div>

      <div className="routine-list">
        {routines && routines.map((routine) => (
          <Routine
            key={routine._id}
            routine={routine}
            onDelete={handleDeleteRoutine}
            onEdit={handleEditRoutine}
          />
        ))}
      </div>

      {showAddModal && <RoutineFormModal onClose={() => setShowAddModal(false)} />}
      {showEditModal && currentRoutine && (
        <RoutineEditModal
          routine={currentRoutine}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditRoutineSubmit}
        />
      )}
    </div>
  );
};

export default Routines;
