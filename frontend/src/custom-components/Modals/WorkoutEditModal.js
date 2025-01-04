import { useState, useEffect } from "react";
import { useWorkoutsContext } from "../../hooks/useWorkoutsContext";
import "./modal.css";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
const WorkoutEditModal = ({ workout, setShowEditModal, routineId }) => {
    const { dispatch: workoutDispatch } = useWorkoutsContext();
    const [title, setTitle] = useState(workout.title);
    const [timeBased, setTimeBased] = useState(!!workout.timeBased);
    const [cardio, setCardio] = useState(!!workout.cardio);
    const [sets, setSets] = useState(workout.sets);
    const [error, setError] = useState(null);
    const [emptyFields, setEmptyFields] = useState([]);

    const URL =
        process.env.NODE_ENV === "production"
            ? "https://brawn-tedx.onrender.com"
            : "http://localhost:4000";

    useEffect(() => {
        setTitle(workout.title);
        setTimeBased(!!workout.timeBased);
        setCardio(!!workout.cardio);
        setSets(workout.sets);
    }, [workout]);

    const handleSetChange = (index, event) => {
        const newSets = [...sets];
        if (event.target.name === "time") {
            const timeValue = event.target.value.replace(/\D/g, "").slice(0, 6);
            newSets[index][event.target.name] = timeValue;
        } else {
            newSets[index][event.target.name] = event.target.value;
        }
        setSets(newSets);
    };

    const handleAddSet = () => {
        setSets([
            ...sets,
            cardio || timeBased
                ? { weight: "", time: "" }
                : { weight: "", reps: "" },
        ]);
    };

    const handleRemoveSet = (index) => {
        const newSets = sets.filter((_, i) => i !== index);
        setSets(newSets);
    };

    const clearSetValues = (newSets, isTimeBased, isCardio) => {
        return newSets.map((set) => ({
            weight: isCardio ? 0 : set.weight,
            reps: isTimeBased || isCardio ? 0 : set.reps,
            time: isTimeBased || isCardio ? set.time || "" : 0,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newEmptyFields = [];

        if (!title.trim()) {
            newEmptyFields.push("title");
        }

        sets.forEach((set, index) => {
            if (cardio || timeBased) {
                if (!set.time) {
                    newEmptyFields.push(`sets[${index}].time`);
                }
            } else {
                if (!set.weight) {
                    newEmptyFields.push(`sets[${index}].weight`);
                }
                if (!set.reps) {
                    newEmptyFields.push(`sets[${index}].reps`);
                }
            }
        });

        if (newEmptyFields.length > 0) {
            setEmptyFields(newEmptyFields);
            return;
        }

        const updatedSets = sets.map((set) => ({
            weight: cardio ? 0 : set.weight || 0,
            reps: cardio || timeBased ? 0 : set.reps || 0,
            time: cardio || timeBased ? set.time || 0 : 0,
        }));

        const updatedWorkout = {
            title,
            sets: updatedSets,
            timeBased,
            cardio,
        };

        const response = await fetch(
            `${URL}/api/routines/${routineId}/workouts/${workout._id}`,
            {
                method: "PATCH",
                body: JSON.stringify(updatedWorkout),
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        );
        const json = await response.json();

        if (!response.ok) {
            setError(json.error || "Something went wrong.");
            setEmptyFields(json.emptyFields || []);
        } else {
            setError(null);
            workoutDispatch({ type: "UPDATE_WORKOUT", payload: json });
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

                    <Label>Exercise Title:</Label>
                    <input
                        type="text"
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                        className={emptyFields.includes("title") ? "error" : ""}
                    />

                    <div className="checkbox-group flex">
                        <div className="time-based">
                            <input
                                className="checkbox-input"
                                type="checkbox"
                                checked={timeBased}
                                onChange={() => {
                                    setTimeBased(!timeBased);
                                    if (!timeBased) {
                                        setCardio(false);
                                    }
                                    setSets(
                                        clearSetValues(sets, !timeBased, false)
                                    );
                                }}
                            />
                            <Label className="time-based-text">
                                Time Based
                            </Label>
                        </div>
                        <div className="time-based">
                            <input
                                className="checkbox-input"
                                type="checkbox"
                                checked={cardio}
                                onChange={() => {
                                    setCardio(!cardio);
                                    if (!cardio) {
                                        setTimeBased(false);
                                    }
                                    setSets(
                                        clearSetValues(sets, false, !cardio)
                                    );
                                }}
                            />
                            <Label className="time-based-text">
                                Cardio Based
                            </Label>
                        </div>
                    </div>

                    <div className="workout-table">
                        <div className="workout-table-header">
                            <span>SET</span>
                            {!cardio && <span>LBS</span>}
                            <span>
                                {timeBased || cardio ? "TIME" : "REPS"}
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
                        <Button variant="default" type="submit">
                            Save Changes
                        </Button>
                    </div>

                    {error && <div className="error">{error}</div>}
                </form>
            </div>
        </div>
    );
};

export default WorkoutEditModal;
