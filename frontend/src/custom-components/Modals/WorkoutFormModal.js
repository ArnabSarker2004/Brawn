import { useState } from "react";
import './modal.css';
import {Button} from '../../components/ui/button';
import { useWorkoutsContext } from "../../hooks/useWorkoutsContext"
const WorkoutFormModal = ({ setShowModal, routineId }) => {

    const { dispatch } = useWorkoutsContext();
    const [title, setTitle] = useState('');
    const [timeBased, setTimeBased] = useState(false);  
    const [sets, setSets] = useState([{ reps: '', weight: '', time: '' }]);
    const [error, setError] = useState(null);
    const URL = process.env.NODE_ENV === 'production'
    ? 'https://brawn-tedx.onrender.com'
    : 'http://localhost:4000';
    
    const token = localStorage.getItem('token');
    const handleSetChange = (index, event) => {
        const newSets = [...sets];
        newSets[index][event.target.name] = event.target.value;
        setSets(newSets);
    };

    const handleAddSet = () => {
        setSets([...sets, { reps: '', weight: '', time: '' }]);
    };

    const handleRemoveSet = (index) => {
        const newSets = sets.filter((_, i) => i !== index);
        setSets(newSets);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const workout = {
        title, sets: sets.map(set => ({
            weight: set.weight,
            reps: timeBased ? undefined : set.reps, 
            time: timeBased ? set.time : undefined
        })),
        timeBased
        };

        try {
            const response = await fetch(`${URL}/api/routines/${routineId}/workouts`, {
                method: 'POST',
                body: JSON.stringify(workout),
                headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
                },
                credentials:'include'
        });

        if (response.ok) {
            const newWorkout = await response.json();
            dispatch({ type: 'CREATE_WORKOUT', payload: newWorkout });
            setShowModal(false); 
        } else {
            const json = await response.json();
            setError(json.error);
        }
        } catch (error) {
            console.error('Error adding workout:', error);
        }
    };

    return (
            <div className="modal">
                <div className="modal-content">
                    <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                    <form onSubmit={handleSubmit}>
                    <h3>Add a New Workout</h3>

                    <label>Exercise Title:</label>
                    <input
                        type="text"
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
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
                            />
                            <input
                            type="number"
                            name={timeBased ? "time" : "reps"}
                            onChange={(e) => handleSetChange(index, e)}
                            value={timeBased ? set.time : set.reps}
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

export default WorkoutFormModal;