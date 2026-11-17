import { useMemo, useState } from "react";
import {
    Activity,
    BarChart3,
    BookOpen,
    Clock3,
    Dumbbell,
    Layers3,
    Target,
    UserRound,
    X,
} from "lucide-react";
import {
    formatLargeNumber,
    formatWorkoutTime,
    getExerciseForWorkout,
    getExerciseHistoryStats,
    getWorkoutTime,
    getWorkoutVolume,
} from "../../utils/exerciseInsights";
import "./exerciseInfoModal.css";

const musclePositions = {
    Abs: { front: [50, 49] },
    Adductors: { front: [50, 70] },
    Back: { back: [50, 41] },
    Biceps: { front: [31, 38] },
    Calves: { back: [43, 86], front: [43, 86] },
    Chest: { front: [50, 31] },
    Core: { front: [50, 50], back: [50, 51] },
    "Full Body": { front: [50, 48], back: [50, 48] },
    Forearms: { front: [25, 53], back: [75, 53] },
    "Front Delts": { front: [35, 29] },
    Glutes: { back: [50, 62] },
    Hamstrings: { back: [50, 75] },
    Heart: { front: [46, 32] },
    "Hip Flexors": { front: [50, 62] },
    Lats: { back: [40, 43] },
    "Lower Back": { back: [50, 53] },
    Obliques: { front: [39, 50] },
    Quads: { front: [50, 74] },
    "Rear Delts": { back: [35, 30] },
    "Rotator Cuff": { back: [35, 31] },
    Shoulders: { front: [32, 29], back: [32, 29] },
    "Side Delts": { front: [31, 30] },
    "T-Spine": { back: [50, 38] },
    Traps: { back: [50, 27] },
    Triceps: { back: [28, 39] },
    "Upper Back": { back: [50, 36] },
    "Upper Chest": { front: [50, 28] },
};

const BodyFigure = ({ view, primaryMuscles, secondaryMuscles }) => {
    const dots = [...primaryMuscles, ...secondaryMuscles]
        .map((muscle) => ({
            muscle,
            primary: primaryMuscles.includes(muscle),
            position: musclePositions[muscle]?.[view],
        }))
        .filter((item) => item.position);

    return (
        <div className="exercise-body-figure">
            <p>{view === "front" ? "Front" : "Back"}</p>
            <svg viewBox="0 0 100 100" aria-hidden="true" className="exercise-body-svg">
                <circle cx="50" cy="12" r="7" />
                <path d="M39 22 Q50 17 61 22 L66 48 Q61 59 57 67 L61 94 H53 L50 72 L47 94 H39 L43 67 Q39 59 34 48 Z" />
                <path d="M38 25 L20 49 L25 55 L40 39" />
                <path d="M62 25 L80 49 L75 55 L60 39" />
                {dots.map(({ muscle, primary, position }) => (
                    <circle
                        key={`${view}-${muscle}-${position.join("-")}`}
                        cx={position[0]}
                        cy={position[1]}
                        r={primary ? 5.2 : 3.8}
                        className={primary ? "exercise-body-dot primary" : "exercise-body-dot secondary"}
                    />
                ))}
            </svg>
        </div>
    );
};

const SetRows = ({ workout }) => {
    const isTimed = workout?.cardio || workout?.timeBased;

    if (!workout?.sets?.length) {
        return <p className="exercise-info-muted">No sets logged yet.</p>;
    }

    return (
        <div className="exercise-set-table">
            <div className="exercise-set-row head">
                <span>Set</span>
                {!workout.cardio && <span>Lb</span>}
                <span>{isTimed ? "Time" : "Reps"}</span>
            </div>
            {workout.sets.map((set, index) => (
                <div className="exercise-set-row" key={`${workout._id || workout.title}-${index}`}>
                    <span>{index + 1}</span>
                    {!workout.cardio && <span>{Number(set.weight || 0)}</span>}
                    <span>{isTimed ? formatWorkoutTime(set.time) : Number(set.reps || 0)}</span>
                </div>
            ))}
        </div>
    );
};

const ExerciseInfoModal = ({ exercise, workout, workouts = [], routines = [], routineName = "This routine", onClose }) => {
    const [tab, setTab] = useState("summary");
    const profile = useMemo(() => exercise || getExerciseForWorkout(workout), [exercise, workout]);
    const scopedWorkouts = useMemo(() => {
        const routineWorkouts = routines.flatMap((routine) =>
            (routine.workouts || []).map((item) => ({ ...item, routineName: routine.name }))
        );

        if (routineWorkouts.length) return routineWorkouts;
        if (workouts.length) return workouts.map((item) => ({ ...item, routineName }));
        return workout ? [{ ...workout, routineName }] : [];
    }, [routineName, routines, workout, workouts]);
    const stats = useMemo(() => getExerciseHistoryStats(profile, scopedWorkouts), [profile, scopedWorkouts]);
    const selectedWorkout = workout || stats.matches[0];
    const tabs = [
        { id: "summary", label: "Summary", icon: BarChart3 },
        { id: "history", label: "History", icon: Clock3 },
        { id: "howto", label: "How to", icon: BookOpen },
        { id: "muscles", label: "Muscles", icon: UserRound },
        { id: "programming", label: "Plan", icon: Layers3 },
    ];

    return (
        <div className="exercise-info-backdrop" role="dialog" aria-modal="true">
            <div className="exercise-info-modal">
                <div className="exercise-info-header">
                    <div className="exercise-info-title-block">
                        <p className="exercise-info-eyebrow">{profile.category} exercise</p>
                        <h2>{profile.name}</h2>
                        <p>{profile.equipment} | {profile.difficulty} | {profile.primaryMuscles.join(", ")}</p>
                    </div>
                    <button type="button" className="exercise-info-close" onClick={onClose} aria-label="Close exercise details">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="exercise-info-tabs">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button key={id} type="button" className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {tab === "summary" && (
                    <div className="exercise-info-panel">
                        <div className="exercise-summary-grid">
                            <div className="exercise-hero-tile">
                                <Dumbbell className="h-9 w-9" />
                                <span>{profile.tags.slice(0, 3).join(" / ")}</span>
                            </div>
                            <div className="exercise-stat-grid">
                                <div>
                                    <span>Logged sets</span>
                                    <strong>{stats.totalSets}</strong>
                                </div>
                                <div>
                                    <span>Total volume</span>
                                    <strong>{formatLargeNumber(stats.totalVolume)}</strong>
                                </div>
                                <div>
                                    <span>Best load</span>
                                    <strong>{stats.bestWeight ? `${stats.bestWeight} lb` : "0"}</strong>
                                </div>
                                <div>
                                    <span>{selectedWorkout?.cardio || selectedWorkout?.timeBased ? "Best time" : "Best reps"}</span>
                                    <strong>
                                        {selectedWorkout?.cardio || selectedWorkout?.timeBased
                                            ? formatWorkoutTime(stats.bestTime)
                                            : stats.bestReps}
                                    </strong>
                                </div>
                            </div>
                        </div>
                        {selectedWorkout && (
                            <div className="exercise-current-workout">
                                <div className="exercise-info-section-title">
                                    <h3>Current routine entry</h3>
                                    <span>{selectedWorkout.routineName || routineName}</span>
                                </div>
                                <SetRows workout={selectedWorkout} />
                            </div>
                        )}
                    </div>
                )}

                {tab === "history" && (
                    <div className="exercise-info-panel">
                        <div className="exercise-history-list">
                            {stats.matches.length ? (
                                stats.matches.map((item) => (
                                    <div className="exercise-history-card" key={item._id || `${item.title}-${item.routineName}`}>
                                        <div>
                                            <h3>{item.title}</h3>
                                            <p>{item.routineName || routineName}</p>
                                        </div>
                                        <div className="exercise-history-metrics">
                                            <span>{item.sets?.length || 0} sets</span>
                                            <span>
                                                {item.cardio || item.timeBased
                                                    ? `${formatWorkoutTime(getWorkoutTime(item))} total`
                                                    : `${formatLargeNumber(getWorkoutVolume(item))} lb total`}
                                            </span>
                                        </div>
                                        <SetRows workout={item} />
                                    </div>
                                ))
                            ) : (
                                <div className="exercise-info-empty">
                                    <Activity className="h-7 w-7" />
                                    <h3>No history yet</h3>
                                    <p>Once this exercise appears in routines, every logged set will show here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {tab === "howto" && (
                    <div className="exercise-info-panel">
                        <div className="exercise-howto-layout">
                            <div className="exercise-step-list">
                                {profile.tutorial.map((step, index) => (
                                    <div className="exercise-step" key={step}>
                                        <span>{index + 1}</span>
                                        <p>{step}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="exercise-coach-grid">
                                <div>
                                    <h3>Coaching cues</h3>
                                    {profile.cues.map((cue) => <p key={cue}>{cue}</p>)}
                                </div>
                                <div>
                                    <h3>Watch for</h3>
                                    {profile.mistakes.map((mistake) => <p key={mistake}>{mistake}</p>)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "muscles" && (
                    <div className="exercise-info-panel">
                        <div className="exercise-muscle-layout">
                            <div className="exercise-body-diagram">
                                <BodyFigure view="front" primaryMuscles={profile.primaryMuscles} secondaryMuscles={profile.secondaryMuscles} />
                                <BodyFigure view="back" primaryMuscles={profile.primaryMuscles} secondaryMuscles={profile.secondaryMuscles} />
                            </div>
                            <div className="exercise-muscle-card">
                                <h3>Primary muscles</h3>
                                <div className="exercise-muscle-chips">
                                    {profile.primaryMuscles.map((muscle) => <span className="primary" key={muscle}>{muscle}</span>)}
                                </div>
                                <h3>Secondary muscles</h3>
                                <div className="exercise-muscle-chips">
                                    {profile.secondaryMuscles.map((muscle) => <span key={muscle}>{muscle}</span>)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "programming" && (
                    <div className="exercise-info-panel">
                        <div className="exercise-program-grid">
                            <div>
                                <Target className="h-5 w-5" />
                                <h3>Strength</h3>
                                <p>3 to 5 sets, 3 to 6 reps, longer rest, clean reps.</p>
                            </div>
                            <div>
                                <Activity className="h-5 w-5" />
                                <h3>Hypertrophy</h3>
                                <p>3 to 4 sets, 8 to 12 reps, controlled tempo.</p>
                            </div>
                            <div>
                                <Clock3 className="h-5 w-5" />
                                <h3>Conditioning</h3>
                                <p>Timed rounds or intervals when the movement fits.</p>
                            </div>
                            <div>
                                <BarChart3 className="h-5 w-5" />
                                <h3>Progression</h3>
                                <p>Add reps first, then load, and deload when form slips.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseInfoModal;
