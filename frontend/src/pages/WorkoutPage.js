import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
    Check,
    ChevronLeft,
    Clock3,
    Dumbbell,
    Flag,
    Minus,
    Pause,
    Play,
    Plus,
    RotateCcw,
    Save,
    TimerReset,
    Trash2,
    X,
} from "lucide-react";
import WorkoutFormModal from "../custom-components/Modals/WorkoutFormModal";
import WorkoutDetails from "../custom-components/Workout/WorkoutDetails";
import { useTimer } from "../context/TimerContext";
import { useSocialPosts } from "../context/SocialPostsContext";
import { useWorkoutsContext } from "../hooks/useWorkoutsContext";
import {
    formatLargeNumber,
    formatWorkoutTime,
    getWorkoutTime,
    getWorkoutVolume,
} from "../utils/exerciseInsights";

const URL =
    process.env.NODE_ENV === "production"
        ? "https://brawn-tedx.onrender.com"
        : "http://localhost:4000";

const ActivityVolumeIcon = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 17h16" />
        <path d="M6 17V7" />
        <path d="M18 17V7" />
        <path d="M8 7h8" />
    </svg>
);

const clampNumber = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

const formatDurationClock = (seconds = 0) => {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const remainingSeconds = safeSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const getDefaultRestSeconds = (workout) => {
    if (workout?.cardio) return 60;
    if (workout?.timeBased) return 75;
    return 90;
};

const getSetKey = (workoutId, set, index) => `${workoutId}-${set?._id || index}`;

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

const makeDraftSets = (workout) =>
    (workout?.sets?.length ? workout.sets : [{ weight: "", reps: "", time: "" }]).map((set) => ({
        ...set,
        weight: workout?.cardio ? 0 : set.weight ?? "",
        reps: workout?.timeBased || workout?.cardio ? 0 : set.reps ?? "",
        time: workout?.timeBased || workout?.cardio ? formatTimeDraft(set.time) : set.time || "",
    }));

const makeEmptyLiveSet = (workout) =>
    workout?.timeBased || workout?.cardio
        ? { weight: workout?.cardio ? 0 : "", reps: 0, time: "" }
        : { weight: "", reps: "", time: 0 };

const getWorkoutPayload = (workout, sets) => ({
    title: workout.title,
    timeBased: !!workout.timeBased,
    cardio: !!workout.cardio,
    sets: sets.map((set) => ({
        weight: workout.cardio ? 0 : Number(set.weight || 0),
        reps: workout.cardio || workout.timeBased ? 0 : Number(set.reps || 0),
        time: workout.cardio || workout.timeBased ? parseTimeDraft(set.time || "") : 0,
    })),
});

const LiveWorkoutExercise = ({
    workout,
    routineId,
    exerciseNumber,
    completedSets,
    onToggleSet,
    restSeconds,
    onRestSecondsChange,
    restRemaining,
    isRestActive,
    onStartRest,
    onStopRest,
}) => {
    const { dispatch } = useWorkoutsContext();
    const [draftSets, setDraftSets] = useState(() => makeDraftSets(workout));
    const [saveState, setSaveState] = useState("saved");
    const [error, setError] = useState(null);
    const isTimed = workout.timeBased || workout.cardio;
    const completedCount = draftSets.filter((set, index) => completedSets[getSetKey(workout._id, set, index)]).length;

    useEffect(() => {
        setDraftSets(makeDraftSets(workout));
        setSaveState("saved");
        setError(null);
    }, [workout]);

    const saveDraft = useCallback(async (nextSets = draftSets) => {
        setSaveState("saving");
        setError(null);

        try {
            const response = await fetch(`${URL}/api/routines/${routineId}/workouts/${workout._id}`, {
                method: "PATCH",
                body: JSON.stringify(getWorkoutPayload(workout, nextSets)),
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            const json = await response.json();

            if (!response.ok) {
                setSaveState("dirty");
                setError(json.error || "Could not save this exercise.");
                return;
            }

            dispatch({ type: "UPDATE_WORKOUT", payload: json });
            setSaveState("saved");
        } catch (saveError) {
            console.error("Error saving live workout set:", saveError);
            setSaveState("dirty");
            setError("Could not reach the server.");
        }
    }, [dispatch, draftSets, routineId, workout]);

    const updateSetValue = (index, name, value) => {
        setDraftSets((currentSets) =>
            currentSets.map((set, currentIndex) =>
                currentIndex === index
                    ? { ...set, [name]: name === "time" ? sanitizeTimeDraft(value) : value }
                    : set
            )
        );
        setSaveState("dirty");
    };

    const handleAddSet = () => {
        const nextSets = [...draftSets, makeEmptyLiveSet(workout)];
        setDraftSets(nextSets);
        saveDraft(nextSets);
    };

    const handleRemoveSet = (index) => {
        if (draftSets.length === 1) return;

        const nextSets = draftSets.filter((_, currentIndex) => currentIndex !== index);
        setDraftSets(nextSets);
        saveDraft(nextSets);
    };

    const handleToggleSet = (set, index) => {
        const setKey = getSetKey(workout._id, set, index);
        const isComplete = !!completedSets[setKey];

        if (saveState === "dirty") {
            saveDraft(draftSets);
        }

        onToggleSet(workout._id, set, index, !isComplete);
    };

    return (
        <article className={`live-exercise-card${isRestActive ? " resting" : ""}`}>
            <div className="live-exercise-top">
                <div className="live-exercise-title">
                    <p className="workout-eyebrow">Exercise {exerciseNumber}</p>
                    <h3>{workout.title}</h3>
                    <span>{completedCount} of {draftSets.length} sets complete</span>
                </div>

                <div className="live-rest-panel">
                    <div>
                        <span>Rest</span>
                        <strong>{formatDurationClock(isRestActive ? restRemaining : restSeconds)}</strong>
                    </div>
                    <div className="live-rest-controls">
                        <button
                            type="button"
                            onClick={() => onRestSecondsChange(workout._id, restSeconds - 15)}
                            aria-label={`Decrease ${workout.title} rest time`}
                            title="Decrease rest"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <input
                            type="number"
                            min="0"
                            max="600"
                            step="15"
                            value={restSeconds}
                            onChange={(event) => onRestSecondsChange(workout._id, event.target.value)}
                            aria-label={`${workout.title} rest seconds`}
                        />
                        <button
                            type="button"
                            onClick={() => onRestSecondsChange(workout._id, restSeconds + 15)}
                            aria-label={`Increase ${workout.title} rest time`}
                            title="Increase rest"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="live-rest-actions">
                        <button type="button" onClick={() => onStartRest(workout._id)}>
                            <TimerReset className="h-4 w-4" />
                            Start
                        </button>
                        {isRestActive && (
                            <button type="button" onClick={onStopRest}>
                                <X className="h-4 w-4" />
                                Skip
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className={`live-set-table${workout.cardio ? " cardio" : ""}`}>
                <div className="live-set-row live-set-head">
                    <span>Done</span>
                    <span>Set</span>
                    {!workout.cardio && <span>Lb</span>}
                    <span>{isTimed ? "Time" : "Reps"}</span>
                    <span></span>
                </div>

                {draftSets.map((set, index) => {
                    const setKey = getSetKey(workout._id, set, index);
                    const isComplete = !!completedSets[setKey];

                    return (
                        <div className={`live-set-row${isComplete ? " complete" : ""}`} key={setKey}>
                            <button
                                type="button"
                                className="live-check-button"
                                onClick={() => handleToggleSet(set, index)}
                                aria-label={`${isComplete ? "Uncheck" : "Check off"} ${workout.title} set ${index + 1}`}
                            >
                                {isComplete ? <Check className="h-5 w-5" /> : <span />}
                            </button>
                            <strong>{index + 1}</strong>
                            {!workout.cardio && (
                                <input
                                    type="number"
                                    min="0"
                                    inputMode="decimal"
                                    value={set.weight}
                                    onChange={(event) => updateSetValue(index, "weight", event.target.value)}
                                    onBlur={() => saveDraft()}
                                    aria-label={`${workout.title} set ${index + 1} weight`}
                                />
                            )}
                            {isTimed ? (
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={set.time}
                                    onChange={(event) => updateSetValue(index, "time", event.target.value)}
                                    onBlur={() => saveDraft()}
                                    placeholder="1:30"
                                    aria-label={`${workout.title} set ${index + 1} duration`}
                                />
                            ) : (
                                <input
                                    type="number"
                                    min="0"
                                    inputMode="numeric"
                                    value={set.reps}
                                    onChange={(event) => updateSetValue(index, "reps", event.target.value)}
                                    onBlur={() => saveDraft()}
                                    aria-label={`${workout.title} set ${index + 1} reps`}
                                />
                            )}
                            <button
                                type="button"
                                className="live-remove-set"
                                onClick={() => handleRemoveSet(index)}
                                disabled={draftSets.length === 1}
                                aria-label={`Remove ${workout.title} set ${index + 1}`}
                                title="Remove set"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="live-exercise-actions">
                <button type="button" onClick={handleAddSet}>
                    <Plus className="h-4 w-4" />
                    Add set
                </button>
                <button type="button" className="primary" onClick={() => saveDraft()}>
                    <Save className="h-4 w-4" />
                    Save
                </button>
                <span className={`live-save-state ${saveState}`}>
                    {saveState === "saving" ? "Saving" : saveState === "dirty" ? "Unsaved changes" : "Saved"}
                </span>
            </div>
            {error && <p className="live-save-error">{error}</p>}
        </article>
    );
};

const WorkoutPage = () => {
    const { workouts, dispatch: workoutsDispatch } = useWorkoutsContext();
    const [showModal, setShowModal] = useState(false);
    const [routineName, setRoutineName] = useState("");
    const [liveMode, setLiveMode] = useState(false);
    const [completedSets, setCompletedSets] = useState({});
    const [restDurations, setRestDurations] = useState({});
    const [activeRest, setActiveRest] = useState(null);
    const [handledAutoStart, setHandledAutoStart] = useState(false);
    const { routineId } = useParams();
    const [searchParams] = useSearchParams();
    const { handleStart, handlePause, isRunning, handleComplete, timer } = useTimer();
    const { openComposer } = useSocialPosts();
    const workoutList = useMemo(() => workouts || [], [workouts]);
    const totalSets = workoutList.reduce((total, workout) => total + (workout.sets?.length || 0), 0);
    const totalVolume = workoutList.reduce((total, workout) => total + getWorkoutVolume(workout), 0);
    const totalTime = workoutList.reduce((total, workout) => total + getWorkoutTime(workout), 0);
    const completedSetCount = workoutList.reduce(
        (total, workout) =>
            total + (workout.sets || []).filter((set, index) => completedSets[getSetKey(workout._id, set, index)]).length,
        0
    );
    const activeRestWorkout = useMemo(
        () => workoutList.find((workout) => workout._id === activeRest?.workoutId),
        [activeRest?.workoutId, workoutList]
    );

    useEffect(() => {
        const fetchRoutineDetails = async () => {
            const response = await fetch(`${URL}/api/routines/${routineId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            const data = await response.json();

            if (response.ok) {
                setRoutineName(data.name);
            }
        };

        const fetchWorkouts = async () => {
            const response = await fetch(`${URL}/api/routines/${routineId}/workouts`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            const data = await response.json();

            if (response.ok) {
                workoutsDispatch({ type: "SET_WORKOUTS", payload: data });
            }
        };

        fetchRoutineDetails();
        fetchWorkouts();
    }, [routineId, workoutsDispatch]);

    useEffect(() => {
        if (!activeRest || !isRunning || activeRest.remaining <= 0) return undefined;

        const interval = setInterval(() => {
            setActiveRest((currentRest) => {
                if (!currentRest) return currentRest;
                const nextRemaining = Math.max(0, currentRest.remaining - 1);
                return { ...currentRest, remaining: nextRemaining };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [activeRest, isRunning]);

    const getRestDuration = useCallback(
        (workout) => restDurations[workout._id] ?? getDefaultRestSeconds(workout),
        [restDurations]
    );

    const startRestTimer = useCallback((workoutId) => {
        const workout = workoutList.find((item) => item._id === workoutId);
        if (!workout) return;

        const duration = getRestDuration(workout);
        if (!duration) {
            setActiveRest(null);
            return;
        }

        setActiveRest({
            workoutId,
            duration,
            remaining: duration,
        });
    }, [getRestDuration, workoutList]);

    const updateRestDuration = (workoutId, value) => {
        const nextValue = clampNumber(value, 0, 600);
        setRestDurations((currentDurations) => ({ ...currentDurations, [workoutId]: nextValue }));
        setActiveRest((currentRest) =>
            currentRest?.workoutId === workoutId
                ? { ...currentRest, duration: nextValue, remaining: Math.min(currentRest.remaining, nextValue) }
                : currentRest
        );
    };

    const handleToggleSet = useCallback((workoutId, set, index, isComplete) => {
        const setKey = getSetKey(workoutId, set, index);

        setCompletedSets((currentSets) => ({
            ...currentSets,
            [setKey]: isComplete,
        }));

        if (isComplete) {
            startRestTimer(workoutId);
        }
    }, [startRestTimer]);

    const startLiveWorkout = useCallback(() => {
        setLiveMode(true);
        if (!isRunning) {
            handleStart();
        }
    }, [handleStart, isRunning]);

    useEffect(() => {
        if (handledAutoStart || searchParams.get("live") !== "1") return;

        setHandledAutoStart(true);
        startLiveWorkout();
    }, [handledAutoStart, searchParams, startLiveWorkout]);

    const handleCompleteWorkout = async () => {
        const shareWorkout = {
            title: routineName || "Workout complete",
            duration: timer > 0 ? formatDurationClock(timer) : totalTime ? formatWorkoutTime(totalTime) : "46 min",
            volume: totalVolume ? `${formatLargeNumber(totalVolume)} lb` : `${completedSetCount}/${totalSets || 0} sets`,
            exercises: workoutList.slice(0, 6).map((workout) => {
                const workoutVolume = getWorkoutVolume(workout);
                const workoutTime = getWorkoutTime(workout);
                return {
                    name: workout.title,
                    detail: workout.cardio || workout.timeBased
                        ? `${workout.sets?.length || 0} sets · ${formatWorkoutTime(workoutTime)}`
                        : `${workout.sets?.length || 0} sets · ${formatLargeNumber(workoutVolume)} lb`,
                };
            }),
        };

        try {
            const response = await fetch(`${URL}/api/routines/${routineId}/complete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ value: timer }),
            });

            if (!response.ok) {
                console.error("Failed to complete workout");
            }
        } catch (completeError) {
            console.error("Failed to complete workout", completeError);
        }

        setLiveMode(false);
        setActiveRest(null);
        setCompletedSets({});
        handleComplete();
        openComposer({
            source: "workout",
            caption: `Finished ${shareWorkout.title}.`,
            workout: shareWorkout,
            photos: [
                {
                    src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1100&q=80",
                    label: "Workout complete",
                },
            ],
        });
    };

    if (liveMode) {
        return (
            <div className="workout-page-shell live-workout-shell">
                <header className="live-workout-header">
                    <div className="live-workout-title">
                        <Link to="/routines" className="workout-back-link">
                            <ChevronLeft className="h-4 w-4" />
                            Routines
                        </Link>
                        <p className="workout-eyebrow">Live workout</p>
                        <h1>{routineName || "Workout"}</h1>
                    </div>

                    <div className="live-clock-card">
                        <span>Elapsed</span>
                        <strong>{formatDurationClock(timer)}</strong>
                    </div>

                    <div className="live-header-actions">
                        <button type="button" className="workout-action" onClick={isRunning ? handlePause : handleStart}>
                            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            {isRunning ? "Pause" : "Resume"}
                        </button>
                        <button type="button" className="workout-action" onClick={() => setLiveMode(false)}>
                            <Dumbbell className="h-4 w-4" />
                            Edit routine
                        </button>
                        <button type="button" className="workout-action primary" onClick={handleCompleteWorkout}>
                            <Flag className="h-4 w-4" />
                            Finish
                        </button>
                    </div>
                </header>

                <section className="live-workout-dashboard">
                    <div>
                        <span>Sets done</span>
                        <strong>{completedSetCount}/{totalSets || 0}</strong>
                    </div>
                    <div>
                        <span>Planned volume</span>
                        <strong>{formatLargeNumber(totalVolume)} lb</strong>
                    </div>
                    <div className={activeRest ? "active" : ""}>
                        <span>{activeRestWorkout ? `Rest: ${activeRestWorkout.title}` : "Rest timer"}</span>
                        <strong>{formatDurationClock(activeRest?.remaining || 0)}</strong>
                    </div>
                </section>

                <section className="live-workout-list">
                    {workoutList.length ? (
                        workoutList.map((workout, index) => (
                            <LiveWorkoutExercise
                                key={workout._id}
                                workout={workout}
                                routineId={routineId}
                                exerciseNumber={index + 1}
                                completedSets={completedSets}
                                onToggleSet={handleToggleSet}
                                restSeconds={getRestDuration(workout)}
                                onRestSecondsChange={updateRestDuration}
                                restRemaining={activeRest?.workoutId === workout._id ? activeRest.remaining : getRestDuration(workout)}
                                isRestActive={activeRest?.workoutId === workout._id}
                                onStartRest={startRestTimer}
                                onStopRest={() => setActiveRest(null)}
                            />
                        ))
                    ) : (
                        <div className="workout-empty-state">
                            <Dumbbell className="h-8 w-8" />
                            <h3>No exercises yet</h3>
                            <p>Add exercises before starting the live workout.</p>
                            <button type="button" onClick={() => {
                                setLiveMode(false);
                                setShowModal(true);
                            }}>
                                <Plus className="h-4 w-4" />
                                Add exercise
                            </button>
                        </div>
                    )}
                </section>
            </div>
        );
    }

    return (
        <div className="workout-page-shell">
            <header className="workout-page-header">
                <div>
                    <Link to="/routines" className="workout-back-link">
                        <ChevronLeft className="h-4 w-4" />
                        Back to routines
                    </Link>
                    <p className="workout-eyebrow">Routine</p>
                    <h1>{routineName || "Workout"}</h1>
                    <p className="workout-header-copy">
                        Build the plan here, then switch into live workout mode for check-offs, quick edits, and rest timing.
                    </p>
                </div>
                <div className="workout-page-actions">
                    <button type="button" className="workout-action primary" onClick={startLiveWorkout}>
                        <Play className="h-4 w-4" />
                        {timer > 0 ? "Resume workout" : "Start workout"}
                    </button>
                    {timer > 0 && (
                        <button type="button" className="workout-action" onClick={() => {
                            handleComplete();
                            setActiveRest(null);
                            setCompletedSets({});
                        }}>
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </button>
                    )}
                    <button type="button" className="workout-action" onClick={handleCompleteWorkout}>
                        <Flag className="h-4 w-4" />
                        Complete
                    </button>
                    <button type="button" className="workout-action" onClick={() => setShowModal(true)}>
                        <Plus className="h-4 w-4" />
                        Add exercise
                    </button>
                </div>
            </header>

            <section className="workout-summary-strip">
                <div>
                    <Dumbbell className="h-4 w-4" />
                    <span>{workoutList.length} exercises</span>
                </div>
                <div>
                    <Flag className="h-4 w-4" />
                    <span>{totalSets} sets</span>
                </div>
                <div>
                    <ActivityVolumeIcon />
                    <span>{formatLargeNumber(totalVolume)} lb</span>
                </div>
                <div>
                    <Clock3 className="h-4 w-4" />
                    <span>{timer > 0 ? formatDurationClock(timer) : totalTime ? formatWorkoutTime(totalTime) : "0:00"}</span>
                </div>
            </section>

            {showModal && (
                <WorkoutFormModal
                    setShowModal={setShowModal}
                    routineId={routineId}
                />
            )}

            <section className="workout-list-panel">
                <div className="workout-section-title">
                    <div>
                        <p className="workout-eyebrow">Exercises</p>
                        <h2>{workoutList.length ? "Routine builder" : "No exercises yet"}</h2>
                    </div>
                    <button type="button" onClick={() => setShowModal(true)} aria-label="Add exercise">
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
                <div className="workout-grid">
                    {workoutList.length ? (
                        workoutList.map((workout) => (
                            <WorkoutDetails
                                key={workout._id}
                                workout={workout}
                                routineId={routineId}
                                workouts={workoutList}
                                routineName={routineName}
                            />
                        ))
                    ) : (
                        <div className="workout-empty-state">
                            <Dumbbell className="h-8 w-8" />
                            <h3>Add your first exercise</h3>
                            <p>Build this routine with sets, reps, timed work, and exercise-specific analytics.</p>
                            <button type="button" onClick={() => setShowModal(true)}>
                                <Plus className="h-4 w-4" />
                                Add exercise
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default WorkoutPage;
