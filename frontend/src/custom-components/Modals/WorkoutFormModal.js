import { useState } from "react";
import "./modal.css";
import { Button } from "../../components/ui/button";
import { useWorkoutsContext } from "../../hooks/useWorkoutsContext";

const WorkoutFormModal = ({ setShowModal, routineId }) => {
    const { dispatch } = useWorkoutsContext();
    const [title, setTitle] = useState("");
    const [timeBased, setTimeBased] = useState(false);
    const [cardio, setCardio] = useState(false);
    const [sets, setSets] = useState([{ reps: "", weight: "", time: "" }]);
    const [error, setError] = useState(null);
    const [emptyFields, setEmptyFields] = useState([]);

    const URL =
        process.env.NODE_ENV === "production"
            ? "https://brawn-tedx.onrender.com"
            : "http://localhost:4000";

    const handleSetChange = (index, event) => {
        const newSets = [...sets];
        if (event.target.name === "time") {
            // Only allow numbers
            const timeValue = event.target.value.replace(/\D/g, "").slice(0, 6);
            newSets[index][event.target.name] = timeValue;
        } else {
            newSets[index][event.target.name] = event.target.value;
        }
        setSets(newSets);
    };

    const handleAddSet = () => {
        setSets([...sets, { reps: "", weight: "", time: "" }]);
        setError(null);
        setEmptyFields([]);
    };

    const handleRemoveSet = (index) => {
        const newSets = sets.filter((_, i) => i !== index);
        setSets(newSets);
    };

    const validateFields = () => {
        const emptyFields = [];
        if (!title.trim()) emptyFields.push("title");

        sets.forEach((set, index) => {
            if (!cardio && !set.weight)
                emptyFields.push(`sets[${index}].weight`);
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
            setError("Please fill in all fields.");
            setEmptyFields(emptyFields);
            return;
        }

        const workout = {
            title,
            sets: sets.map((set) => ({
                weight: cardio ? 0 : set.weight,
                reps: timeBased || cardio ? 0 : set.reps,
                time: timeBased || cardio ? set.time : 0,
            })),
            timeBased,
            cardio,
        };

        try {
            const response = await fetch(
                `${URL}/api/routines/${routineId}/workouts`,
                {
                    method: "POST",
                    body: JSON.stringify(workout),
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );

            if (response.ok) {
                const newWorkout = await response.json();
                dispatch({ type: "CREATE_WORKOUT", payload: newWorkout });
                setShowModal(false);
            } else {
                setError("Something went wrong.");
            }
        } catch (error) {
            console.error("Error adding workout:", error);
            setError("Something went wrong.");
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={() => setShowModal(false)}>
                    &times;
                </span>
                <form onSubmit={handleSubmit}>
                    <h3>Add a New Workout</h3>

                    <label>Exercise Title:</label>
                    <input
                        type="text"
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                        className={emptyFields.includes("title") ? "error" : ""}
                    />

                    <div className="checkbox-group">
                        <div className="time-based">
                            <label className="time-based-text">
                                Time Based:
                            </label>
                            <input
                                className="checkbox-input"
                                type="checkbox"
                                checked={timeBased}
                                onChange={() => {
                                    setTimeBased(!timeBased);
                                    setCardio(false);
                                }}
                            />
                        </div>
                        <div className="time-based">
                            <label className="time-based-text">
                                Cardio Based:
                            </label>
                            <input
                                className="checkbox-input"
                                type="checkbox"
                                checked={cardio}
                                onChange={() => {
                                    setCardio(!cardio);
                                    setTimeBased(false);
                                }}
                            />
                        </div>
                    </div>

                    <div className="workout-table">
                        <div className="workout-table-header">
                            <span>SET</span>
                            {!cardio && <span>LBS</span>}
                            <span>
                                {timeBased || cardio ? "TIME (s)" : "REPS"}
                            </span>
                        </div>
                        {sets.map((set, index) => (
                            <div className="workout-table-row" key={index}>
                                <span>{index + 1}</span>
                                {!cardio && (
                                    <input
                                        type="number"
                                        name="weight"
                                        onChange={(e) =>
                                            handleSetChange(index, e)
                                        }
                                        value={set.weight}
                                        className={
                                            emptyFields.includes(
                                                `sets[${index}].weight`
                                            )
                                                ? "error"
                                                : ""
                                        }
                                    />
                                )}
                                {timeBased || cardio ? (
                                    <input
                                        type="text"
                                        name="time"
                                        onChange={(e) =>
                                            handleSetChange(index, e)
                                        }
                                        value={set.time || ""}
                                        placeholder="HHMMSS"
                                        maxLength="6"
                                        className={
                                            emptyFields.includes(
                                                `sets[${index}].time`
                                            )
                                                ? "error"
                                                : ""
                                        }
                                    />
                                ) : (
                                    <input
                                        type="number"
                                        name="reps"
                                        onChange={(e) =>
                                            handleSetChange(index, e)
                                        }
                                        value={set.reps}
                                        className={
                                            emptyFields.includes(
                                                `sets[${index}].reps`
                                            )
                                                ? "error"
                                                : ""
                                        }
                                    />
                                )}
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
                        <Button variant="default">Save Workout</Button>
                    </div>

                    {error && <div className="error">{error}</div>}
                </form>
            </div>
        </div>
    );
};

export default WorkoutFormModal;
