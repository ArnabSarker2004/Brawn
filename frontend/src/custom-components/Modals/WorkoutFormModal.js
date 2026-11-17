import { useMemo, useState } from "react";
import { Check, Clock3, Dumbbell, Search, Target, X } from "lucide-react";
import {
    exerciseCategories,
    getExerciseSearchResults,
    muscleGroups,
} from "../../data/exerciseDatabase";
import { useWorkoutsContext } from "../../hooks/useWorkoutsContext";
import "./modal.css";

const URL =
    process.env.NODE_ENV === "production"
        ? "https://brawn-tedx.onrender.com"
        : "http://localhost:4000";

const makeEmptySet = (isTimed, isCardio) =>
    isTimed || isCardio ? { weight: isCardio ? 0 : "", reps: 0, time: "" } : { weight: "", reps: "", time: 0 };

const getDefaultSets = (isTimed, isCardio, count = 3) =>
    Array.from({ length: count }, () => makeEmptySet(isTimed, isCardio));

const WorkoutFormModal = ({ setShowModal, routineId }) => {
    const { dispatch } = useWorkoutsContext();
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [muscle, setMuscle] = useState("All");
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [title, setTitle] = useState("");
    const [timeBased, setTimeBased] = useState(false);
    const [cardio, setCardio] = useState(false);
    const [sets, setSets] = useState(getDefaultSets(false, false));
    const [error, setError] = useState(null);
    const [emptyFields, setEmptyFields] = useState([]);

    const searchResults = useMemo(
        () => getExerciseSearchResults(query, category, muscle).slice(0, 14),
        [query, category, muscle]
    );

    const updateSetMode = (nextTimeBased, nextCardio) => {
        setTimeBased(nextTimeBased);
        setCardio(nextCardio);
        setSets((currentSets) =>
            (currentSets.length ? currentSets : getDefaultSets(nextTimeBased, nextCardio)).map((set) => ({
                weight: nextCardio ? 0 : nextTimeBased ? set.weight || "" : set.weight || "",
                reps: nextTimeBased || nextCardio ? 0 : set.reps || "",
                time: nextTimeBased || nextCardio ? set.time || "" : 0,
            }))
        );
        setEmptyFields([]);
    };

    const selectExercise = (exercise) => {
        const nextCardio = exercise.category === "Cardio";

        setSelectedExercise(exercise);
        setTitle(exercise.name);
        setQuery(exercise.name);
        setTimeBased(false);
        setCardio(nextCardio);
        setSets(getDefaultSets(false, nextCardio));
        setEmptyFields([]);
        setError(null);
    };

    const handleSetChange = (index, event) => {
        const newSets = [...sets];
        const { name, value } = event.target;

        newSets[index] = {
            ...newSets[index],
            [name]: name === "time" ? value.replace(/\D/g, "").slice(0, 6) : value,
        };

        setSets(newSets);
        setEmptyFields([]);
    };

    const handleAddSet = () => {
        setSets([...sets, makeEmptySet(timeBased, cardio)]);
    };

    const handleRemoveSet = (index) => {
        setSets((currentSets) =>
            currentSets.length > 1 ? currentSets.filter((_, currentIndex) => currentIndex !== index) : currentSets
        );
    };

    const validateFields = () => {
        const newEmptyFields = [];
        if (!title.trim()) newEmptyFields.push("title");

        sets.forEach((set, index) => {
            if (cardio || timeBased) {
                if (!set.time) newEmptyFields.push(`sets[${index}].time`);
            } else {
                if (!set.weight) newEmptyFields.push(`sets[${index}].weight`);
                if (!set.reps) newEmptyFields.push(`sets[${index}].reps`);
            }
        });

        return newEmptyFields;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const newEmptyFields = validateFields();
        if (newEmptyFields.length > 0) {
            setEmptyFields(newEmptyFields);
            return;
        }

        const workout = {
            title: title.trim(),
            sets: sets.map((set) => ({
                weight: cardio ? 0 : Number(set.weight || 0),
                reps: timeBased || cardio ? 0 : Number(set.reps || 0),
                time: timeBased || cardio ? Number(set.time || 0) : 0,
            })),
            timeBased,
            cardio,
        };

        try {
            const response = await fetch(`${URL}/api/routines/${routineId}/workouts`, {
                method: "POST",
                body: JSON.stringify(workout),
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (response.ok) {
                const newWorkout = await response.json();
                dispatch({ type: "CREATE_WORKOUT", payload: newWorkout });
                setShowModal(false);
            } else {
                setError("Could not add this exercise.");
            }
        } catch (submitError) {
            console.error("Error adding workout:", submitError);
            setError("Could not reach the server.");
        }
    };

    return (
        <div className="modal add-exercise-backdrop" role="dialog" aria-modal="true">
            <form className="modal-content add-exercise-modal" onSubmit={handleSubmit}>
                <button type="button" className="add-exercise-close" onClick={() => setShowModal(false)} aria-label="Close add exercise">
                    <X className="h-5 w-5" />
                </button>

                <div className="add-exercise-header">
                    <div>
                        <p>Add exercise</p>
                        <h3>Choose from the database</h3>
                    </div>
                    <span>{selectedExercise ? selectedExercise.category : "Custom ready"}</span>
                </div>

                <div className="add-exercise-layout">
                    <section className="exercise-picker-panel">
                        <div className="exercise-picker-search">
                            <Search className="h-5 w-5" />
                            <input
                                value={query}
                                onChange={(event) => {
                                    setQuery(event.target.value);
                                    setTitle(event.target.value);
                                    setSelectedExercise(null);
                                    setEmptyFields([]);
                                }}
                                placeholder="Search bench, glutes, low impact cardio..."
                            />
                        </div>

                        <div className="exercise-picker-filters">
                            <select value={category} onChange={(event) => setCategory(event.target.value)}>
                                {exerciseCategories.map((item) => <option key={item}>{item}</option>)}
                            </select>
                            <select value={muscle} onChange={(event) => setMuscle(event.target.value)}>
                                {muscleGroups.map((item) => <option key={item}>{item}</option>)}
                            </select>
                        </div>

                        <div className="exercise-picker-results">
                            {searchResults.map((exercise) => (
                                <button
                                    type="button"
                                    key={exercise.id}
                                    className={selectedExercise?.id === exercise.id ? "selected" : ""}
                                    onClick={() => selectExercise(exercise)}
                                >
                                    <span className="exercise-result-icon">
                                        {selectedExercise?.id === exercise.id ? <Check className="h-4 w-4" /> : <Dumbbell className="h-4 w-4" />}
                                    </span>
                                    <span>
                                        <strong>{exercise.name}</strong>
                                        <small>{exercise.primaryMuscles.join(", ")} | {exercise.equipment}</small>
                                    </span>
                                    <em>{exercise.category}</em>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="exercise-builder-panel">
                        <label className="builder-label" htmlFor="exercise-title">Exercise name</label>
                        <input
                            id="exercise-title"
                            value={title}
                            onChange={(event) => {
                                setTitle(event.target.value);
                                setSelectedExercise(null);
                                setEmptyFields([]);
                            }}
                            className={emptyFields.includes("title") ? "error" : ""}
                            placeholder="Custom exercise name"
                        />

                        {selectedExercise && (
                            <div className="selected-exercise-summary">
                                <Target className="h-5 w-5" />
                                <div>
                                    <strong>{selectedExercise.primaryMuscles.join(", ")}</strong>
                                    <span>{selectedExercise.secondaryMuscles.slice(0, 3).join(", ") || "No secondary muscles listed"}</span>
                                </div>
                            </div>
                        )}

                        <div className="exercise-mode-toggle" aria-label="Exercise tracking mode">
                            <button type="button" className={!timeBased && !cardio ? "active" : ""} onClick={() => updateSetMode(false, false)}>
                                <Dumbbell className="h-4 w-4" />
                                Weight + reps
                            </button>
                            <button type="button" className={timeBased ? "active" : ""} onClick={() => updateSetMode(true, false)}>
                                <Clock3 className="h-4 w-4" />
                                Time
                            </button>
                            <button type="button" className={cardio ? "active" : ""} onClick={() => updateSetMode(false, true)}>
                                <Clock3 className="h-4 w-4" />
                                Cardio
                            </button>
                        </div>

                        <div className={`builder-set-table ${cardio ? "two-col" : ""}`}>
                            <div className="builder-set-row head">
                                <span>Set</span>
                                {!cardio && <span>Lb</span>}
                                <span>{timeBased || cardio ? "Time" : "Reps"}</span>
                                <span></span>
                            </div>
                            {sets.map((set, index) => (
                                <div className="builder-set-row" key={index}>
                                    <span>{index + 1}</span>
                                    {!cardio && (
                                        <input
                                            type="number"
                                            name="weight"
                                            min="0"
                                            value={set.weight}
                                            onChange={(event) => handleSetChange(index, event)}
                                            className={emptyFields.includes(`sets[${index}].weight`) ? "error" : ""}
                                        />
                                    )}
                                    {timeBased || cardio ? (
                                        <input
                                            type="text"
                                            name="time"
                                            value={set.time || ""}
                                            placeholder="MMSS"
                                            maxLength="6"
                                            onChange={(event) => handleSetChange(index, event)}
                                            className={emptyFields.includes(`sets[${index}].time`) ? "error" : ""}
                                        />
                                    ) : (
                                        <input
                                            type="number"
                                            name="reps"
                                            min="0"
                                            value={set.reps}
                                            onChange={(event) => handleSetChange(index, event)}
                                            className={emptyFields.includes(`sets[${index}].reps`) ? "error" : ""}
                                        />
                                    )}
                                    <button type="button" onClick={() => handleRemoveSet(index)} aria-label={`Remove set ${index + 1}`}>
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="add-exercise-actions">
                            <button type="button" className="secondary" onClick={handleAddSet}>Add set</button>
                            <button type="submit" className="primary">Add to routine</button>
                        </div>
                        {error && <div className="error">{error}</div>}
                    </section>
                </div>
            </form>
        </div>
    );
};

export default WorkoutFormModal;
