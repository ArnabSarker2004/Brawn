import { useState } from 'react';
import { useWorkoutsContext } from '../../hooks/useWorkoutsContext';
import WorkoutEditModal from '../Modals/WorkoutEditModal';
import './workout.css';
const WorkoutDetails = ({ workout, routineId }) => {
  const { dispatch } = useWorkoutsContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const token = localStorage.getItem('token');

  const URL = process.env.NODE_ENV === 'production'
  ? 'https://brawn-tedx.onrender.com'
  : 'http://localhost:4000';
  const handleDelete = async () => {
    try {
      const response = await fetch(`${URL}/api/routines/${routineId}/workouts/${workout._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
          },
          credentials:'include'
      });
      if (response.ok) {
        dispatch({ type: 'DELETE_WORKOUT', payload: { _id: workout._id } });
      } else {
        console.error('Failed to delete workout');
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  return (
    <div className="workout-details">
      <h4>{workout.title}</h4>
      <div className="workout-table">
        <div className="workout-table-header">
          <span>SET</span>
          <span>LBS</span>
          <span>{workout.timeBased ? "TIME (s)" : "REPS"}</span>
        </div>
        {workout.sets.map((set, index) => (
          <div className="workout-table-row" key={index}>
            <span>{index + 1}</span>
            <span>{set.weight} lbs</span>
            <span>{workout.timeBased ? `${set.time} sec` : `${set.reps} reps`}</span>
          </div>
        ))}
      </div>

      <div className="workout-actions">
        <span className="material-symbols-outlined edit" onClick={() => setShowEditModal(true)}>edit</span>
        <span className="material-symbols-outlined close" onClick={handleDelete}>delete</span>
      </div>

      {showEditModal && <WorkoutEditModal workout={workout} setShowEditModal={setShowEditModal} routineId={routineId} />}
    </div>
  );
};

export default WorkoutDetails;
