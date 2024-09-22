import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoutineEditModal from './RoutineEditModal';

const Routine = ({ routine, onDelete, workouts = [] }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="routine-details">
      {/* Routine Name */}
      <h4 onClick={() => navigate(`/routines/${routine._id}`)}>{routine.name}</h4>
      
      {/* Display Workout Names */}
      <div className="routine-workouts">
        {workouts && workouts.length > 0 ? (
          <ul>
            {workouts.map((workout) => (
              <li key={workout._id}>{workout.title}</li>
            ))}
          </ul>
        ) : (
          <p>No workouts added yet.</p>
        )}
      </div>

      {/* Routine Actions */}
      <div className="routine-actions">
        <span className="material-symbols-outlined" onClick={() => setIsEditModalOpen(true)}>edit</span>
        <span className="material-symbols-outlined" onClick={() => setIsDeleteModalOpen(true)}>delete</span>
      </div>
      
      {/* Edit Routine Modal */}
      {isEditModalOpen && (
        <RoutineEditModal
          routine={routine}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Confirm Delete Modal */}
      {isDeleteModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h4>Confirm Delete</h4>
            <p>Are you sure you want to delete this routine? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button 
                onClick={() => {
                  onDelete(routine._id); // Call onDelete only when confirm is pressed
                  setIsDeleteModalOpen(false); // Close modal after confirming delete
                }} 
                className="delete-btn"
              >
                Delete
              </button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Routine;
