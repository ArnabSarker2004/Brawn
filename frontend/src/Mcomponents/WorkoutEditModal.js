import { useState, useEffect } from 'react';
import { useWorkoutsContext } from '../hooks/useWorkoutsContext';

const WorkoutEditModal = ({ workout, setShowEditModal, routineId }) => {
  const { dispatch: workoutDispatch } = useWorkoutsContext();
  const [title, setTitle] = useState(workout.title);
  const [sets, setSets] = useState(workout.sets);
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);

  useEffect(() => {
    setTitle(workout.title);
    setSets(workout.sets);
  }, [workout]);

  const handleSetChange = (index, event) => {
    const newSets = [...sets];
    newSets[index][event.target.name] = event.target.value;
    setSets(newSets);
  };

  const handleAddSet = () => {
    setSets([...sets, { reps: '', weight: '' }]);
  };

  const handleRemoveSet = (index) => {
    const newSets = sets.filter((_, i) => i !== index);
    setSets(newSets);
  };

  const validateFields = () => {
    const emptyFields = [];
    if (!title.trim()) emptyFields.push('title');
    sets.forEach((set, index) => {
      if (!set.weight) emptyFields.push(`sets[${index}].weight`);
      if (!set.reps) emptyFields.push(`sets[${index}].reps`);
    });
    return emptyFields;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emptyFields = validateFields();
    if (emptyFields.length > 0) {
      setError('Please fill in all fields.');
      setEmptyFields(emptyFields);
      return;
    }

    const updatedWorkout = { title, sets };

    const response = await fetch(`/api/routines/${routineId}/workouts/${workout._id}`, {
      method: 'PATCH',
      body: JSON.stringify(updatedWorkout),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json();

    if (!response.ok) {
      setError(json.error || 'Something went wrong.');
      setEmptyFields(json.emptyFields || []);
    } else {
      setError(null);
      workoutDispatch({ type: 'UPDATE_WORKOUT', payload: json });
      setShowEditModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={handleCloseModal}>
          &times;
        </span>
        <form onSubmit={handleSubmit}>
          <h3>Edit Workout</h3>

          <label>Exercise Title:</label>
          <input
            type="text"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            className={emptyFields.includes('title') ? 'error' : ''}
          />

          <div className="workout-table">
            <div className="workout-table-header">
              <span>SET</span>
              <span>LBS</span>
              <span>REPS</span>
              <span></span>
            </div>
            {sets.map((set, index) => (
              <div className="workout-table-row" key={index}>
                <span>{index + 1}</span>
                <input
                  type="number"
                  name="weight"
                  onChange={(e) => handleSetChange(index, e)}
                  value={set.weight}
                  className={emptyFields.includes(`sets[${index}].weight`) ? 'error' : ''}
                />
                <input
                  type="number"
                  name="reps"
                  onChange={(e) => handleSetChange(index, e)}
                  value={set.reps}
                  className={emptyFields.includes(`sets[${index}].reps`) ? 'error' : ''}
                />
                <button type="button" onClick={() => handleRemoveSet(index)} className="remove-set-btn">
                  Remove Set
                </button>
              </div>
            ))}
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={handleAddSet} className="add-set-btn">
              Add Set
            </button>
            <button type="submit" className="save-workout-btn">
              Save Workout
            </button>
          </div>

          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default WorkoutEditModal;
