import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Edit3, Trash2 } from 'lucide-react';
import { useWorkoutsContext } from '../../hooks/useWorkoutsContext';
import ExerciseInfoModal from '../Exercise/ExerciseInfoModal';
import WorkoutEditModal from '../Modals/WorkoutEditModal';
import { formatLargeNumber, formatWorkoutTime, getWorkoutVolume } from '../../utils/exerciseInsights';
import './workout.css';
const WorkoutDetails = ({ workout, routineId, workouts = [], routineName }) => {
  const { dispatch } = useWorkoutsContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const sets = workout.sets || [];
  const modalRoot = typeof document === "undefined" ? null : document.body;

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

  const totalVolume = getWorkoutVolume(workout);
  const isTimed = workout.cardio || workout.timeBased;

  return (
    <div className="workout-details hevy-exercise-card">
      <div className="workout-card-header">
        <div>
          <h4>
            <button
              type="button"
              className="workout-title-button"
              onClick={() => setShowExerciseModal(true)}
              aria-label={`Open ${workout.title} exercise details`}
            >
              {workout.title}
            </button>
          </h4>
          <div className="workout-card-meta">
            <span>{workout.sets?.length || 0} sets</span>
            <span>{isTimed ? "Timed" : `${formatLargeNumber(totalVolume)} lb`}</span>
          </div>
        </div>
      </div>
      <div className={`workout-table ${workout.cardio ? "two-col" : ""}`}>
        <div className="workout-table-header">
            <span>SET</span>
            {!workout.cardio && <span>LBS</span>}
            <span>{workout.cardio ? "TIME" : workout.timeBased ? "TIME" : "REPS"}</span>
        </div>
        {sets.map((set, index) => (
          <div className="workout-table-row" key={index}>
            <span>{index + 1}</span>
            {!workout.cardio && <span>{set.weight} lbs</span>}
            <span>
              {workout.cardio || workout.timeBased 
                ? formatWorkoutTime(set.time)
                : `${set.reps} reps`}
            </span>
          </div>
        ))}
      </div>

      <div className="workout-actions">
        <button type="button" onClick={() => setShowEditModal(true)} aria-label={`Edit ${workout.title}`}>
          <Edit3 className="h-4 w-4" />
          Edit
        </button>
        <button type="button" className="danger" onClick={handleDelete} aria-label={`Delete ${workout.title}`}>
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      {modalRoot && showEditModal && createPortal(
        <WorkoutEditModal workout={workout} setShowEditModal={setShowEditModal} routineId={routineId} />,
        modalRoot
      )}
      {modalRoot && showExerciseModal && createPortal(
        <ExerciseInfoModal
          workout={workout}
          workouts={workouts}
          routineName={routineName}
          onClose={() => setShowExerciseModal(false)}
        />,
        modalRoot
      )}
    </div>
  );
};

export default WorkoutDetails;
