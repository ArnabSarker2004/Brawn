import React, { useState } from 'react';
import { useRoutinesContext } from '../../hooks/useRoutinesContext';

const RoutineFormModal = ({ onClose }) => {
  const { dispatch } = useRoutinesContext(); 
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (name.trim() === '') {
      setError('Please fill in all the fields');
      return;
    }

    setError(null); 

    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create routine');
      } else {
        dispatch({ type: 'CREATE_ROUTINE', payload: data });

        onClose();
      }
    } catch (err) {
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
