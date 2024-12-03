import React, { useState } from 'react';
import { useRoutinesContext } from '../../hooks/useRoutinesContext';
const RoutineEditModal = ({ routine, onClose }) => {
  const [name, setName] = useState(routine.name);
  const [error, setError] = useState(null);
  const { dispatch } = useRoutinesContext();

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Routine name cannot be empty.');
      return;
    }

    try {
      // Call API to update routine name
      const response = await fetch(`/api/routines/${routine._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const updatedRoutine = await response.json();

      if (!response.ok) {
        setError(updatedRoutine.error || 'Failed to update routine');
        return;
      }

      // Dispatch the updated routine to the context
      dispatch({ type: 'UPDATE_ROUTINE', payload: updatedRoutine });

      // Close the modal on successful update
      onClose();
    } catch (err) {
      setError('An error occurred while updating the routine.');
      console.error(err);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h4>Edit Routine Name</h4>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Routine Name"
        />
        {error && <div className="error">{error}</div>}
        <div className="modal-buttons">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default RoutineEditModal;
