import { useState, useEffect } from 'react';
import { useWorkoutsContext } from '../../hooks/useWorkoutsContext';
import './modal.css';
import { Button } from '../../components/ui/button';

const WorkoutEditModal = ({ workout, setShowEditModal, routineId }) => {
    const { dispatch: workoutDispatch } = useWorkoutsContext();
    const [title, setTitle] = useState(workout.title);
    const [timeBased, setTimeBased] = useState(workout.timeBased);
    const [cardio, setCardio] = useState(workout.cardio || false);
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
        setCardio(workout.cardio || false);
    }, [workout]);

    const handleSetChange = (index, event) => {
        const newSets = [...sets];
        newSets[index][event.target.name] = event.target.value;
        setSets(newSets);
    };

    const handleAddSet = () => {
        setSets([
            ...sets,
            cardio || timeBased
                ? { weight: '', time: '' }
                : { weight: '', reps: '' },
        ]);
    };

    const handleRemoveSet = (index) => {
        const newSets = sets.filter((_, i) => i !== index);
        setSets(newSets);
    };

    const validateFields = () => {
        const emptyFields = [];
        if (!title.trim()) emptyFields.push('title');

        sets.forEach((set, index) => {
            if (!cardio && !set.weight) emptyFields.push(`sets[${index}].weight`);
            if (timeBased || cardio) {
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

        const updatedWorkout = { title, sets, timeBased, cardio };

        const response = await fetch(
            `${URL}/api/routines/${routineId}/workouts/${workout._id}`,
            {
                method: 'PATCH',
                body: JSON.stringify(updatedWorkout),
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            }
        );
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

                    <div className="checkbox-group">
                        <div className="time-based">
                            <label className="time-based-text">Time Based:</label>
                            <input
                                className="checkbox-input"
                                type="checkbox"
                                checked={timeBased}
                                onChange={() => {
                                    setTimeBased(!timeBased);
                                    setCardio(false); // Disable Cardio if Time-Based is checked
                                }}
                            />
                        </div>
                        <div className="time-based"> {/* Using the same styling */}
                            <label className="time-based-text">Cardio Based:</label>
                            <input
                                className="checkbox-input"
                                type="checkbox"
                                checked={cardio}
                                onChange={() => {
                                    setCardio(!cardio);
                                    setTimeBased(false); // Disable Time-Based if Cardio is checked
                                }}
                            />
                        </div>
                    </div>

                    <div className="workout-table">
                        <div className="workout-table-header">
                            <span>SET</span>
                            {!cardio && <span>LBS</span>}
                            <span>{timeBased || cardio ? 'TIME (s)' : 'REPS'}</span>
                        </div>
                        {sets.map((set, index) => (
                            <div className="workout-table-row" key={index}>
                                <span>{index + 1}</span>
                                {!cardio && (
                                    <input
                                        type="number"
                                        name="weight"
                                        onChange={(e) => handleSetChange(index, e)}
                                        value={set.weight}
                                        className={emptyFields.includes(`sets[${index}].weight`) ? 'error' : ''}
                                    />
                                )}
                                <input
                                    type="number"
                                    name={timeBased || cardio ? 'time' : 'reps'}
                                    onChange={(e) => handleSetChange(index, e)}
                                    value={timeBased || cardio ? set.time : set.reps}
                                    className={emptyFields.includes(
                                        `sets[${index}].${timeBased || cardio ? 'time' : 'reps'}`
                                    ) ? 'error' : ''}
                                />
                                <Button
                                    variant="destructive"
                                    className="mr-4 ml-5 mb-2.5 flex align-middle items-center"
                                    onClick={() => handleRemoveSet(index)}
                                >
                                    Remove Set
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="modal-buttons">
                        <Button variant="secondary" onClick={handleAddSet}>
                            Add Set
                        </Button>
                        <Button variant="default">Save Changes</Button>
                    </div>

                    {error && <div className="error">{error}</div>}
                </form>
            </div>
        </div>
    );
};

export default WorkoutEditModal;
