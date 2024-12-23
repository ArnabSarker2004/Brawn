import React, { useState } from 'react';
import { useRoutinesContext } from '../../hooks/useRoutinesContext';
import {Button} from '../../components/ui/button'
import './modal.css';
const RoutineEditModal = ({ routine, onClose }) => {
    const [name, setName] = useState(routine.name);
    const [error, setError] = useState(null);
    const { dispatch } = useRoutinesContext();
    const URL = process.env.NODE_ENV === 'production'
    ? 'https://brawn-tedx.onrender.com'
    : 'http://localhost:4000'; 

    const token = localStorage.getItem('token');
    const handleSave = async () => {
        if (!name.trim()) {
        setError('Routine name cannot be empty.');
        return;
        }

        try {
        const response = await fetch(`${URL}/api/routines/${routine._id}`, {
            method: 'PATCH',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name }),
        });

        const updatedRoutine = await response.json();

        if (!response.ok) {
            setError(updatedRoutine.error || 'Failed to update routine');
            return;
        }

        dispatch({ type: 'UPDATE_ROUTINE', payload: updatedRoutine });

        onClose();
        } catch (err) {
        setError('An error occurred while updating the routine.');
        console.error(err);
        }
    };

return (
    <div className="modal">
        <div className="modal-content">
            <h4 className='modal-text'>Edit Routine Name</h4>
            <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Routine Name"/>
            {error && <div className="error">{error}</div>}
            <div className="modal-buttons">
                <Button variant="default" disabled={false} onClick={handleSave}>
                    Save
                </Button>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </div>
    </div>
);
};

export default RoutineEditModal;
