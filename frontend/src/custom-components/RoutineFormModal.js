import React, { useState } from 'react';
import { useRoutinesContext } from '../hooks/useRoutinesContext';

const RoutineFormModal = ({ onClose }) => {
  const { dispatch } = useRoutinesContext(); // Access dispatch from the context
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation check: Ensure the name is not empty
    if (name.trim() === '') {
      setError('Please fill in all the fields');
      return;
    }

    setError(null); // Clear any existing errors

    try {
      // API call to create a new routine
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the API returns an error, set the error message
        setError(data.error || 'Failed to create routine');
      } else {
        // Update context with the new routine
        dispatch({ type: 'CREATE_ROUTINE', payload: data });

        // Close the modal on success
        onClose();
      }
    } catch (err) {
      // Handle any network or fetch errors
      setError('An error occurred. Please try again.');
      console.error('Error submitting form:', err);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h4>Add New Routine</h4>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Routine Name"
        />
        <div className="modal-buttons">
          <button onClick={handleSubmit}>Add</button>
          <button onClick={onClose}>Cancel</button>
        </div>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
};

export default RoutineFormModal;
