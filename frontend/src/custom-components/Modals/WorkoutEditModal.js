import { useState, useEffect } from 'react';
import { useWorkoutsContext } from '../../hooks/useWorkoutsContext';
import './modal.css';
import {Button} from '../../components/ui/button';

const WorkoutEditModal = ({ workout, setShowEditModal, routineId }) => {
    const { dispatch: workoutDispatch } = useWorkoutsContext();
    const [title, setTitle] = useState(workout.title);
    const [timeBased, setTimeBased] = useState(workout.timeBased);
    const [sets, setSets] = useState(workout.sets);
    const [error, setError] = useState(null);
    const [emptyFields, setEmptyFields] = useState([]);
    const URL = process.env.NODE_ENV === 'production'
        ? 'https://brawn-tedx.onrender.com'
        : 'http://localhost:4000'; 
    useEffect(() => {
        setTitle(workout.title);
        setSets(workout.sets);
        setTimeBased(workout.timeBased);
    }, [workout]);

    const handleSetChange = (index, event) => {
        const newSets = [...sets];
        newSets[index][event.target.name] = event.target.value;
        setSets(newSets);
    };

    const handleAddSet = () => {
        if (timeBased) {
            setSets([...sets, { weight: '', time: '' }]);
        } else {
            setSets([...sets, { weight: '', reps: '' }]);
        }
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
                if (timeBased) {
                    if (!set.time) emptyFields.push(`sets[${index}].time`);
                } else {
                    if (!set.reps) emptyFields.push(`sets[${index}].reps`);
                }
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

        const updatedWorkout = { title, sets, timeBased };

        const response = await fetch(`${URL}/api/routines/${routineId}/workouts/${workout._id}`, {
            method: 'PATCH',
            body: JSON.stringify(updatedWorkout),
            headers: {
                'Content-Type': 'application/json',
            },
            credentials:'include'
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

return (
    <div className="modal">
    <div className="modal-content">
        <span className="close" onClick={() => setShowEditModal(false)}>
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

        <div className="time-based">
            <label className="time-based-text">Time Based:</label>
            <input className="checkbox-input"
            type="checkbox"
            checked={timeBased}
            onChange={(e) => setTimeBased(!timeBased)}
            />
        </div>

        <div className="workout-table">
            <div className="workout-table-header">
            <span>SET</span>
            <span>LBS</span>
            <span>{timeBased ? "TIME (s)" : "REPS"}</span>
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
                name={timeBased ? "time" : "reps"}
                onChange={(e) => handleSetChange(index, e)}
                value={timeBased ? set.time : set.reps}
                className={emptyFields.includes(`sets[${index}].${timeBased ? "time" : "reps"}`) ? 'error' : ''}
                />
                <Button variant="destructive" onClick={() => handleRemoveSet(index)}>
                Remove Set
                </Button>
            </div>
            ))}
        </div>

        <div className="modal-buttons">
            <Button variant="secondary"onClick={handleAddSet}>
            Add Set
            </Button>
            <Button variant="default">
            Save Workout
            </Button>
        </div>

        {error && <div className="error">{error}</div>}
        </form>
    </div>
    </div>
);
};

export default WorkoutEditModal;
