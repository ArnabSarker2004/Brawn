import { useEffect, useState } from "react";
import { Clock3, Dumbbell, Plus, Save, Trash2, X } from "lucide-react";
import { useWorkoutsContext } from "../../hooks/useWorkoutsContext";
import "./modal.css";

const URL =
    process.env.NODE_ENV === "production"
        ? "https://brawn-tedx.onrender.com"
        : "http://localhost:4000";

const sanitizeTimeDraft = (value) => value.toString().replace(/[^\d:]/g, "").slice(0, 8);

const secondsToTimeCode = (totalSeconds) => {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    return hours * 10000 + minutes * 100 + seconds;
};

const formatTimeDraft = (value) => {
    if (!value && value !== 0) return "";

    const rawDigits = value.toString().replace(/\D/g, "");
    const digits = rawDigits.length <= 2 && Number(rawDigits) > 59
        ? secondsToTimeCode(Number(rawDigits)).toString()
        : rawDigits;
    if (!digits || Number(digits) === 0) return "";

    const padded = digits.padStart(digits.length > 4 ? 6 : 4, "0");
    const seconds = padded.slice(-2);
    const minutes = padded.slice(-4, -2);
    const hours = padded.length > 4 ? Number(padded.slice(0, -4)) : 0;

    return hours > 0 ? `${hours}:${minutes}:${seconds}` : `${Number(minutes)}:${seconds}`;
};

const clampNumber = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

const parseTimeDraft = (value) => {
    const draft = value.toString().trim();
    if (!draft) return 0;

    if (draft.includes(":")) {
        const pieces = draft.split(":").map((piece) => Number(piece.replace(/\D/g, "") || 0));
        const [hours, minutes, seconds] =
            pieces.length === 3 ? pieces : pieces.length === 2 ? [0, pieces[0], pieces[1]] : [0, 0, pieces[0]];

        return clampNumber(hours, 0, 99) * 10000 + clampNumber(minutes, 0, 59) * 100 + clampNumber(seconds, 0, 59);
    }

    const digits = draft.replace(/\D/g, "").slice(0, 6);
    if (digits.length <= 2) return secondsToTimeCode(Number(digits || 0));

    return Number(digits || 0);
};

const makeEmptySet = (isTimed, isCardio) =>
    isTimed || isCardio ? { weight: isCardio ? 0 : "", reps: 0, time: "" } : { weight: "", reps: "", time: 0 };

const makeDraftSets = (workout) =>
    (workout?.sets?.length ? workout.sets : [makeEmptySet(workout?.timeBased, workout?.cardio)]).map((set) => ({
        ...set,
        weight: workout?.cardio ? 0 : set.weight ?? "",
        reps: workout?.timeBased || workout?.cardio ? 0 : set.reps ?? "",
        time: workout?.timeBased || workout?.cardio ? formatTimeDraft(set.time) : 0,
    }));

const WorkoutEditModal = ({ workout, setShowEditModal, routineId }) => {
    const { dispatch } = useWorkoutsContext();
    const [title, setTitle] = useState(workout.title);
    const [timeBased, setTimeBased] = useState(!!workout.timeBased);
    const [cardio, setCardio] = useState(!!workout.cardio);
    const [sets, setSets] = useState(() => makeDraftSets(workout));
    const [error, setError] = useState(null);
    const [emptyFields, setEmptyFields] = useState([]);

    useEffect(() => {
        setTitle(workout.title);
        setTimeBased(!!workout.timeBased);
        setCardio(!!workout.cardio);
        setSets(makeDraftSets(workout));
        setError(null);
        setEmptyFields([]);
    }, [workout]);

    const updateSetMode = (nextTimeBased, nextCardio) => {
        setTimeBased(nextTimeBased);
        setCardio(nextCardio);
        setSets((currentSets) =>
            (currentSets.length ? currentSets : [makeEmptySet(nextTimeBased, nextCardio)]).map((set) => ({
                weight: nextCardio ? 0 : set.weight ?? "",
                reps: nextTimeBased || nextCardio ? 0 : set.reps ?? "",
                time: nextTimeBased || nextCardio ? set.time || "" : 0,
            }))
        );
        setEmptyFields([]);
    };

    const handleSetChange = (index, event) => {
        const { name, value } = event.target;
        setSets((currentSets) =>
            currentSets.map((set, currentIndex) =>
                currentIndex === index
                    ? { ...set, [name]: name === "time" ? sanitizeTimeDraft(value) : value }
                    : set
            )
        );
        setEmptyFields([]);
    };

    const handleAddSet = () => {
        setSets((currentSets) => [...currentSets, makeEmptySet(timeBased, cardio)]);
    };

    const handleRemoveSet = (index) => {
        setSets((currentSets) =>
            currentSets.length > 1 ? currentSets.filter((_, currentIndex) => currentIndex !== index) : currentSets
        );
    };

    const validateFields = () => {
        const nextEmptyFields = [];
        if (!title.trim()) nextEmptyFields.push("title");

        sets.forEach((set, index) => {
            if (cardio || timeBased) {
                if (!parseTimeDraft(set.time || "")) nextEmptyFields.push(`sets[${index}].time`);
            } else {
                if (set.weight === "" || set.weight === null || set.weight === undefined) {
                    nextEmptyFields.push(`sets[${index}].weight`);
                }
                if (set.reps === "" || set.reps === null || set.reps === undefined) {
                    nextEmptyFields.push(`sets[${index}].reps`);
                }
            }
        });

        return nextEmptyFields;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const nextEmptyFields = validateFields();
        if (nextEmptyFields.length) {
            setEmptyFields(nextEmptyFields);
            return;
        }

        const updatedWorkout = {
            title: title.trim(),
            timeBased,
            cardio,
            sets: sets.map((set) => ({
                weight: cardio ? 0 : Number(set.weight || 0),
                reps: cardio || timeBased ? 0 : Number(set.reps || 0),
                time: cardio || timeBased ? parseTimeDraft(set.time || "") : 0,
            })),
        };

        try {
            const response = await fetch(`${URL}/api/routines/${routineId}/workouts/${workout._id}`, {
                method: "PATCH",
                body: JSON.stringify(updatedWorkout),
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            const json = await response.json();

            if (!response.ok) {
                setError(json.error || "Something went wrong.");
                setEmptyFields(json.emptyFields || []);
                return;
            }

            dispatch({ type: "UPDATE_WORKOUT", payload: json });
            setShowEditModal(false);
        } catch (submitError) {
            console.error("Error updating workout:", submitError);
            setError("Could not reach the server.");
        }
    };

    return (
        <div className="modal add-exercise-backdrop" role="dialog" aria-modal="true">
            <form className="modal-content add-exercise-modal workout-edit-modal" onSubmit={handleSubmit}>
                <button type="button" className="add-exercise-close" onClick={() => setShowEditModal(false)} aria-label="Close edit exercise">
                    <X className="h-5 w-5" />
                </button>

                <div className="add-exercise-header">
                    <div>
                        <p>Edit exercise</p>
                        <h3>{workout.title}</h3>
                    </div>
                    <span>{cardio ? "Cardio" : timeBased ? "Timed" : "Strength"}</span>
                </div>

                <div className="exercise-builder-panel workout-edit-panel">
                    <label className="builder-label" htmlFor="edit-exercise-title">Exercise name</label>
                    <input
                        id="edit-exercise-title"
                        value={title}
                        onChange={(event) => {
                            setTitle(event.target.value);
                            setEmptyFields([]);
                        }}
                        className={emptyFields.includes("title") ? "error" : ""}
                        placeholder="Exercise name"
                    />

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
                            <div className="builder-set-row" key={set._id || index}>
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
                                        inputMode="numeric"
                                        value={set.time || ""}
                                        placeholder="1:30"
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
                                <button type="button" onClick={() => handleRemoveSet(index)} disabled={sets.length === 1} aria-label={`Remove set ${index + 1}`}>
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="add-exercise-actions">
                        <button type="button" className="secondary" onClick={handleAddSet}>
                            <Plus className="h-4 w-4" />
                            Add set
                        </button>
                        <button type="submit" className="primary">
                            <Save className="h-4 w-4" />
                            Save changes
                        </button>
                    </div>
                    {error && <div className="error">{error}</div>}
                </div>
            </form>
        </div>
    );
};

export default WorkoutEditModal;
