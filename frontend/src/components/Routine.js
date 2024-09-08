import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoutineEditModal from './RoutineEditModal.js';

const Routine = ({ routine, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="routine-details">
      <h4 onClick={() => navigate(`/routines/${routine._id}`)}>{routine.name}</h4> {/* Clickable to show workouts */}
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
              <button onClick={() => onDelete(routine._id)} className="delete-btn">Delete</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Routine;
