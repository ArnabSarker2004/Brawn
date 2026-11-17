import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Activity,
    ArrowLeft,
    ArrowDownRight,
    ArrowUpRight,
    CalendarCheck,
    ChevronDown,
    Clock3,
    Crown,
    Dumbbell,
    Edit3,
    Flame,
    Footprints,
    Layers3,
    Medal,
    MessageSquare,
    MoreHorizontal,
    PlayCircle,
    Plus,
    Search,
    Send,
    ShieldCheck,
    Sparkles,
    Swords,
    Target,
    Timer,
    Trophy,
    Trash2,
    Utensils,
    X,
} from "lucide-react";
import { exerciseDatabase } from "../data/exerciseDatabase";
import { useAuth } from "../context/AuthContext";
import { useRoutinesContext } from "../hooks/useRoutinesContext";
import { getProfileRoute } from "../utils/socialProfiles";
import "./Routines.css";

const URL =
    process.env.NODE_ENV === "production"
        ? "https://brawn-tedx.onrender.com"
        : "http://localhost:4000";

const routineTemplates = [
    { name: "Push Pull Legs", meta: "6 day split", focus: "Volume + frequency" },
    { name: "Upper Lower Strength", meta: "4 day split", focus: "Progressive overload" },
    { name: "Full Body Reset", meta: "3 day split", focus: "Consistency" },
    { name: "Hybrid Engine", meta: "Strength + cardio", focus: "Conditioning" },
];

const normalize = (value = "") => value.toString().toLowerCase().trim();

const formatLargeNumber = (value) => {
    if (!value) return "0";
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${Math.round(value / 100) / 10}k`;
    return `${Math.round(value)}`;
};

const formatUpdatedLabel = (value) => {
    if (!value) return "Recently added";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently added";
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
};

const titleMatchesExercise = (title, exercise) => {
    const normalizedTitle = normalize(title);
    const names = [exercise.name, ...exercise.aliases].map(normalize);

    return names.some((name) => {
        const tokens = name.split(/\s+/).filter((token) => token.length > 2);
        return normalizedTitle.includes(name) || tokens.every((token) => normalizedTitle.includes(token));
    });
};

const getWorkoutVolume = (workout) =>
    workout?.sets?.reduce((total, set) => {
        const weight = Number(set.weight || 0);
        const reps = Number(set.reps || 0);
        return total + weight * reps;
    }, 0) || 0;

const getRoutineStats = (routine) => {
    const workouts = routine.workouts || [];
    const totalSets = workouts.reduce((total, workout) => total + (workout.sets?.length || 0), 0);
    const totalVolume = workouts.reduce((total, workout) => total + getWorkoutVolume(workout), 0);
    const cardioCount = workouts.filter((workout) => workout.cardio).length;
    const matchedExercises = workouts
        .map((workout) => exerciseDatabase.find((exercise) => titleMatchesExercise(workout.title, exercise)))
        .filter(Boolean);
    const muscleCoverage = Array.from(new Set(matchedExercises.flatMap((exercise) => exercise.primaryMuscles)));

    return {
        workouts: workouts.length,
        totalSets,
        totalVolume,
        cardioCount,
        strengthCount: workouts.length - cardioCount,
        muscleCoverage,
    };
};

const getRoutineExercisePreview = (routine) => {
    const titles = (routine.workouts || []).map((workout) => workout.title).filter(Boolean);
    if (!titles.length) return "Draft routine";
    const preview = titles.slice(0, 4).join(", ");
    return titles.length > 4 ? `${preview}, +${titles.length - 4} more` : preview;
};

const RoutineModal = ({ mode, routine, initialName = "", onClose, onSubmit, error }) => {
    const [name, setName] = useState(routine?.name || initialName);

    return (
        <div className="exercise-modal-backdrop" role="dialog" aria-modal="true">
            <form
                className="routine-name-modal"
                onSubmit={(event) => {
                    event.preventDefault();
                    onSubmit(name);
                }}
            >
                <div className="exercise-modal-header">
                    <div>
                        <p className="routines-eyebrow">{mode === "edit" ? "Edit routine" : "New routine"}</p>
                        <h2>{mode === "edit" ? "Rename plan" : "Create routine"}</h2>
                        <span>{mode === "edit" ? "Keep the name clean and easy to scan." : "Give the plan a name that feels ready to train."}</span>
                    </div>
                    <button type="button" className="routine-icon-button" onClick={onClose} aria-label="Close routine modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <label className="routine-form-label" htmlFor="routine-name">Routine name</label>
                <div className="routine-input-shell">
                    <Dumbbell className="h-4 w-4" />
                    <input
                        id="routine-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Upper Hypertrophy A"
                        autoFocus
                    />
                </div>
                {error && <p className="routine-form-error">{error}</p>}
                <div className="routine-form-actions">
                    <button type="button" className="routine-secondary-button" onClick={onClose}>Cancel</button>
                    <button type="submit" className="routine-primary-button">{mode === "edit" ? "Save changes" : "Create routine"}</button>
                </div>
            </form>
        </div>
    );
};

const Routines = () => {
    const { routines, dispatch } = useRoutinesContext();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [routineModal, setRoutineModal] = useState(null);
    const [routineError, setRoutineError] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [routineFilter, setRoutineFilter] = useState("all");
    const [routineSort, setRoutineSort] = useState("recent");
    const [activeRoutineTab, setActiveRoutineTab] = useState("library");
    const [activeChallengeView, setActiveChallengeView] = useState("groups");
    const [selectedChallengeId, setSelectedChallengeId] = useState("cut-30");
    const [challengeSetupModal, setChallengeSetupModal] = useState(null);
    const [challengeChatDrafts, setChallengeChatDrafts] = useState({});
    const [challengeChatMessages, setChallengeChatMessages] = useState({});
    const [expandedChallengeChatId, setExpandedChallengeChatId] = useState(null);
    const routineList = useMemo(() => routines || [], [routines]);

    useEffect(() => {
        const fetchRoutinesWithWorkouts = async () => {
            try {
                const response = await fetch(`${URL}/api/routines`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });

                if (!response.ok) return;

                const routinesData = await response.json();
                const routinesWithWorkouts = await Promise.all(
                    routinesData.map(async (routine) => {
                        const workoutsResponse = await fetch(`${URL}/api/routines/${routine._id}/workouts`, {
                            method: "GET",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                        });

                        const workoutsData = workoutsResponse.ok ? await workoutsResponse.json() : [];
                        return { ...routine, workouts: workoutsData };
                    })
                );

                dispatch({ type: "SET_ROUTINES", payload: routinesWithWorkouts });
            } catch (error) {
                console.error("Failed to fetch routines", error);
            }
        };

        fetchRoutinesWithWorkouts();
    }, [dispatch]);

    const routineSummaries = useMemo(
        () =>
            routineList.map((routine) => ({
                routine,
                stats: getRoutineStats(routine),
                preview: getRoutineExercisePreview(routine),
                updatedLabel: formatUpdatedLabel(routine.updatedAt || routine.createdAt),
            })),
        [routineList]
    );

    const libraryStats = useMemo(
        () =>
            routineSummaries.reduce(
                (totals, summary) => ({
                    routines: totals.routines + 1,
                    exercises: totals.exercises + summary.stats.workouts,
                    sets: totals.sets + summary.stats.totalSets,
                    volume: totals.volume + summary.stats.totalVolume,
                    muscles: new Set([...totals.muscles, ...summary.stats.muscleCoverage]),
                }),
                { routines: 0, exercises: 0, sets: 0, volume: 0, muscles: new Set() }
            ),
        [routineSummaries]
    );

    const featuredRoutine = useMemo(() => {
        if (!routineSummaries.length) return null;
        return [...routineSummaries].sort((a, b) => {
            if (b.stats.workouts !== a.stats.workouts) return b.stats.workouts - a.stats.workouts;
            return b.stats.totalSets - a.stats.totalSets;
        })[0];
    }, [routineSummaries]);

    const visibleRoutines = useMemo(() => {
        const query = normalize(searchQuery);
        return routineSummaries
            .filter(({ routine, preview, stats }) => {
                const matchesSearch =
                    !query ||
                    normalize(routine.name).includes(query) ||
                    normalize(preview).includes(query) ||
                    stats.muscleCoverage.some((muscle) => normalize(muscle).includes(query));

                if (!matchesSearch) return false;
                if (routineFilter === "empty") return stats.workouts === 0;
                if (routineFilter === "cardio") return stats.cardioCount > 0;
                if (routineFilter === "strength") return stats.strengthCount > 0;
                return true;
            })
            .sort((a, b) => {
                if (routineSort === "name") return a.routine.name.localeCompare(b.routine.name);
                if (routineSort === "volume") return b.stats.totalVolume - a.stats.totalVolume;
                if (routineSort === "exercises") return b.stats.workouts - a.stats.workouts;
                return new Date(b.routine.updatedAt || b.routine.createdAt || 0) - new Date(a.routine.updatedAt || a.routine.createdAt || 0);
            });
    }, [routineFilter, routineSort, routineSummaries, searchQuery]);

    const challengeGroups = [
        {
            id: "cut-30",
            title: "Cut 30 lb GC",
            status: "Private",
            objective: "Lose 30 lb with weekly weigh-ins, workout proof, and safe-rate scoring.",
            metric: "Weight lost",
            duration: "12 weeks",
            finish: "First to 30 lb or best verified progress at deadline",
            proof: "Scale check-in + weekly progress post",
            guardrails: ["Max 2 lb/week scoring", "No crash-diet bonuses", "Workout streak required"],
            members: ["You", "Maya", "Jordan", "Alex", "Sam", "Nina"],
            unread: 7,
            icon: ArrowDownRight,
            tone: "cut",
            leaderboard: [
                { name: "You", value: "11.8 lb", delta: "39% complete" },
                { name: "Maya", value: "10.4 lb", delta: "34% complete" },
                { name: "Jordan", value: "8.9 lb", delta: "30% complete" },
                { name: "Alex", value: "7.6 lb", delta: "25% complete" },
            ],
            chat: [
                { name: "Maya", text: "Friday check-in thread is open." },
                { name: "You", text: "Logged lift + weigh-in. Staying boring." },
                { name: "Jordan", text: "Guardrail saved me from doing nonsense today." },
            ],
        },
        {
            id: "gain-30",
            title: "Gain 30 lb GC",
            status: "Invite only",
            objective: "Lean bulk race using bodyweight, volume, protein, and PR receipts.",
            metric: "Lean gain score",
            duration: "20 weeks",
            finish: "Best combined weight + training score",
            proof: "Scale check-in + workout logs",
            guardrails: ["Protein minimum", "No >1.5 lb/week bonus", "Minimum 3 sessions/week"],
            members: ["Sam", "You", "Alex", "Maya"],
            unread: 3,
            icon: ArrowUpRight,
            tone: "gain",
            leaderboard: [
                { name: "Sam", value: "82 pts", delta: "+9.2 lb" },
                { name: "You", value: "74 pts", delta: "+7.5 lb" },
                { name: "Alex", value: "68 pts", delta: "+6.1 lb" },
                { name: "Maya", value: "61 pts", delta: "+4.9 lb" },
            ],
            chat: [
                { name: "Sam", text: "Volume Crown carryover is real." },
                { name: "You", text: "Adding calories slowly. No dirty bulk chaos." },
                { name: "Alex", text: "PR post going up after push day." },
            ],
        },
        {
            id: "step-sprint",
            title: "24h Step Sprint",
            status: "Friends",
            objective: "Most verified steps in one day wins.",
            metric: "Total steps",
            duration: "24 hours",
            finish: "Highest synced step count at midnight",
            proof: "Wearable or phone step sync",
            guardrails: ["No manual entries", "Tie: earliest finish", "One device only"],
            members: ["Maya", "You", "Jordan", "Sam", "Alex"],
            unread: 14,
            icon: Footprints,
            tone: "steps",
            leaderboard: [
                { name: "Maya", value: "18,420", delta: "+4,180 last hour" },
                { name: "You", value: "17,980", delta: "+3,760 last hour" },
                { name: "Jordan", value: "16,440", delta: "+2,910 last hour" },
                { name: "Sam", value: "15,870", delta: "+2,500 last hour" },
            ],
            chat: [
                { name: "Maya", text: "Mall walk counts. No shame, all steps." },
                { name: "You", text: "Taking the long route after dinner." },
                { name: "Jordan", text: "Last hour push at 9?" },
            ],
        },
        {
            id: "calorie-lock",
            title: "Calorie Lock",
            status: "Private",
            objective: "Hit a sustainable calorie range for seven days.",
            metric: "Compliant days",
            duration: "7 days",
            finish: "Most days in target range",
            proof: "Food log or meal photo",
            guardrails: ["Personal calorie floor", "Protein minimum", "No fasting bonus"],
            members: ["Alex", "You", "Maya", "Sam"],
            unread: 5,
            icon: Utensils,
            tone: "calorie",
            leaderboard: [
                { name: "Alex", value: "6 days", delta: "1,980 avg kcal" },
                { name: "You", value: "5 days", delta: "2,060 avg kcal" },
                { name: "Maya", value: "5 days", delta: "2,110 avg kcal" },
                { name: "Sam", value: "4 days", delta: "2,320 avg kcal" },
            ],
            chat: [
                { name: "Alex", text: "Protein target saved me today." },
                { name: "Maya", text: "Posting dinner before I forget." },
                { name: "You", text: "Need a late snack that does not wreck this." },
            ],
        },
        {
            id: "volume-crown",
            title: "Volume Crown",
            status: "Friends",
            objective: "Highest verified weekly training volume wins.",
            metric: "Weekly tonnage",
            duration: "7 days",
            finish: "Highest logged volume by Sunday",
            proof: "Routine logs only",
            guardrails: ["No warmup padding", "No duplicate sessions", "Bodyweight reps normalized"],
            members: ["Sam", "You", "Jordan", "Maya", "Alex", "Nina"],
            unread: 9,
            icon: Crown,
            tone: "volume",
            leaderboard: [
                { name: "Sam", value: "92.1k", delta: "Leg day logged" },
                { name: "You", value: "86.4k", delta: "Pull day pending" },
                { name: "Jordan", value: "79.8k", delta: "Upper done" },
                { name: "Maya", value: "74.5k", delta: "2 sessions left" },
            ],
            chat: [
                { name: "Sam", text: "Squats were a financial decision." },
                { name: "You", text: "Saving back day for the comeback." },
                { name: "Maya", text: "No junk volume court is in session." },
            ],
        },
        {
            id: "zone2-bank",
            title: "Zone 2 Bank",
            status: "Friends",
            objective: "Bank the most verified Zone 2 minutes over a weekend.",
            metric: "Zone 2 minutes",
            duration: "Weekend",
            finish: "Highest eligible minutes",
            proof: "Heart-rate activity sync",
            guardrails: ["Cap 90 min/session", "HR zone required", "Tie: lower avg HR"],
            members: ["Jordan", "You", "Maya", "Alex"],
            unread: 2,
            icon: Timer,
            tone: "time",
            leaderboard: [
                { name: "Jordan", value: "165 min", delta: "2 rides" },
                { name: "You", value: "145 min", delta: "Walk + bike" },
                { name: "Maya", value: "118 min", delta: "Incline walk" },
                { name: "Alex", value: "92 min", delta: "Run logged" },
            ],
            chat: [
                { name: "Jordan", text: "Zone 2 is just patience with sneakers." },
                { name: "You", text: "Podcast pace locked in." },
                { name: "Alex", text: "Keeping ego out of the heart rate." },
            ],
        },
    ];

    const selectedChallenge = challengeGroups.find((challenge) => challenge.id === selectedChallengeId) || challengeGroups[0];
    const selectedLeaderboard = [
        ...selectedChallenge.leaderboard,
        ...selectedChallenge.members
            .filter((member) => !selectedChallenge.leaderboard.some((person) => person.name === member))
            .map((member) => ({ name: member, value: "Pending", delta: "No verified check-in yet" })),
    ];
    const selectedChallengeMessages = challengeChatMessages[selectedChallenge.id] || selectedChallenge.chat;
    const selectedChallengeDraft = challengeChatDrafts[selectedChallenge.id] || "";
    const latestChallengeMessage = selectedChallengeMessages[selectedChallengeMessages.length - 1];
    const getMemberProfileRoute = (name) => getProfileRoute(name, user);

    const challengeLibraries = {
        preset: [
            { title: "24h Step Sprint", objective: "Most synced steps in 24 hours", metric: "Total steps", icon: Footprints },
            { title: "Calorie Lock", objective: "Most days inside calorie target", metric: "Compliant days", icon: Utensils },
            { title: "Volume Crown", objective: "Highest verified weekly tonnage", metric: "Total volume", icon: Crown },
        ],
        community: [
            { title: "Protein Proof", objective: "Hit protein target for 10 days", metric: "Logged days", icon: ShieldCheck },
            { title: "Lunch Walk League", objective: "Daily 20-minute walk streak", metric: "Streak days", icon: Footprints },
            { title: "PR Receipt GC", objective: "Most verified PR posts this month", metric: "PR points", icon: Medal },
        ],
        custom: [
            { title: "Squad Cut Phase", objective: "Friend GC cut with weigh-ins and lifts", metric: "Progress score", icon: Swords },
            { title: "Weekend Engine", objective: "Friend group cardio minutes by Sunday", metric: "Minutes", icon: Timer },
        ],
    };

    const challengeSetupFields = [
        { label: "Group name", value: challengeSetupModal?.title || "" },
        { label: "Friends invited", value: "Maya, Jordan, Sam, Alex" },
        { label: "Objective", value: challengeSetupModal?.objective || "" },
        { label: "Leaderboard metric", value: challengeSetupModal?.metric || "" },
        { label: "Finish condition", value: "Highest verified score by deadline" },
        { label: "Proof required", value: "Auto-sync, workout log, food log, or check-in post" },
        { label: "Guardrails", value: "Limits, floors, caps, proof rules, tie-breakers" },
        { label: "Privacy", value: "Invite-only group chat" },
    ];

    const handleChallengeMessageSubmit = (event) => {
        event.preventDefault();
        const messageText = selectedChallengeDraft.trim();
        if (!messageText) return;

        setChallengeChatMessages((currentMessages) => ({
            ...currentMessages,
            [selectedChallenge.id]: [
                ...(currentMessages[selectedChallenge.id] || selectedChallenge.chat),
                { name: "You", text: messageText },
            ],
        }));
        setChallengeChatDrafts((currentDrafts) => ({
            ...currentDrafts,
            [selectedChallenge.id]: "",
        }));
    };

    const handleCreateRoutine = async (name) => {
        const routineName = name.trim();
        if (!routineName) {
            setRoutineError("Routine name cannot be empty.");
            return;
        }

        try {
            const response = await fetch(`${URL}/api/routines`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: routineName }),
                credentials: "include",
            });
            const data = await response.json();

            if (!response.ok) {
                setRoutineError(data.error || "Failed to create routine.");
                return;
            }

            dispatch({ type: "CREATE_ROUTINE", payload: { ...data, workouts: [] } });
            setRoutineModal(null);
            setRoutineError(null);
        } catch (error) {
            setRoutineError("Could not reach the server.");
            console.error("Error creating routine", error);
        }
    };

    const handleUpdateRoutine = async (name) => {
        const routineName = name.trim();
        if (!routineModal?.routine) return;
        if (!routineName) {
            setRoutineError("Routine name cannot be empty.");
            return;
        }

        try {
            const response = await fetch(`${URL}/api/routines/${routineModal.routine._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: routineName }),
                credentials: "include",
            });
            const data = await response.json();

            if (!response.ok) {
                setRoutineError(data.error || "Failed to update routine.");
                return;
            }

            dispatch({
                type: "UPDATE_ROUTINE",
                payload: { ...routineModal.routine, ...data, workouts: routineModal.routine.workouts || [] },
            });
            setRoutineModal(null);
            setRoutineError(null);
        } catch (error) {
            setRoutineError("Could not reach the server.");
            console.error("Error updating routine", error);
        }
    };

    const handleDeleteRoutine = async () => {
        if (!deleteTarget) return;

        try {
            const response = await fetch(`${URL}/api/routines/${deleteTarget._id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (response.ok) {
                const deletedRoutine = await response.json();
                dispatch({ type: "DELETE_ROUTINE", payload: deletedRoutine?._id ? deletedRoutine : deleteTarget });
                setDeleteTarget(null);
            }
        } catch (error) {
            console.error("Failed to delete routine", error);
        }
    };

    const openCreateModal = (initialName = "") => {
        setRoutineError(null);
        setRoutineModal({ mode: "create", initialName });
    };

    return (
        <div className="routines-page">
            <section className="routines-hero">
                <div className="routines-banner-copy">
                    <p className="routines-eyebrow">Routines</p>
                    <h1>Training library</h1>
                    <span>{routineList.length ? `${routineList.length} plans ready` : "No plans yet"}</span>
                </div>
                <button type="button" className="hevy-new-routine-button" onClick={() => openCreateModal()}>
                    <Plus className="h-4 w-4" />
                    New Routine
                </button>
            </section>

            <nav className="routine-page-tabs" aria-label="Routine page sections">
                <button
                    type="button"
                    className={activeRoutineTab === "library" ? "active" : ""}
                    onClick={() => setActiveRoutineTab("library")}
                >
                    <Layers3 className="h-4 w-4" />
                    Library
                </button>
                <button
                    type="button"
                    className={activeRoutineTab === "challenges" ? "active" : ""}
                    onClick={() => setActiveRoutineTab("challenges")}
                >
                    <Trophy className="h-4 w-4" />
                    Challenges
                </button>
            </nav>

            {activeRoutineTab === "library" ? (
            <>
            <section className="routine-stats-grid" aria-label="Routine summary">
                {[
                    { label: "Plans", value: libraryStats.routines, detail: "saved routines", icon: Layers3 },
                    { label: "Exercises", value: libraryStats.exercises, detail: "programmed", icon: Dumbbell },
                    { label: "Sets", value: libraryStats.sets, detail: "in rotation", icon: Activity },
                    { label: "Volume", value: formatLargeNumber(libraryStats.volume), detail: "lb planned", icon: Flame },
                ].map(({ label, value, detail, icon: Icon }) => (
                    <div key={label} className="routine-stat-card">
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                        <strong>{value}</strong>
                        <p>{detail}</p>
                    </div>
                ))}
            </section>

            <section className="routine-feature-strip">
                <div className="routine-feature-copy">
                    <span className="routine-feature-icon">
                        <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="routines-eyebrow">Next up</p>
                        <h2>{featuredRoutine?.routine.name || "Build your first split"}</h2>
                        <span>
                            {featuredRoutine
                                ? `${featuredRoutine.stats.workouts} exercises / ${featuredRoutine.stats.totalSets} sets / ${formatLargeNumber(featuredRoutine.stats.totalVolume)} lb`
                                : "Start with a template and make it yours."}
                        </span>
                    </div>
                </div>
                <div className="routine-template-rail" aria-label="Routine templates">
                    {routineTemplates.map((template) => (
                        <button type="button" key={template.name} onClick={() => openCreateModal(template.name)}>
                            <strong>{template.name}</strong>
                            <span>{template.meta}</span>
                            <em>{template.focus}</em>
                        </button>
                    ))}
                </div>
            </section>

            <section className="routines-layout">
                <div className="routine-library-toolbar">
                    <div>
                        <p className="routines-eyebrow">Your plans</p>
                        <h2>My Routines</h2>
                    </div>
                    <div className="routine-controls">
                        <label className="routine-search-control">
                            <Search className="h-4 w-4" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search routines, exercises, muscles"
                            />
                            {searchQuery && (
                                <button type="button" className="routine-search-clear" onClick={() => setSearchQuery("")} aria-label="Clear routine search">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </label>
                        <label className="routine-select-control">
                            <select value={routineFilter} onChange={(event) => setRoutineFilter(event.target.value)} aria-label="Filter routines">
                                <option value="all">All plans</option>
                                <option value="strength">Strength</option>
                                <option value="cardio">Cardio</option>
                                <option value="empty">Drafts</option>
                            </select>
                            <ChevronDown className="h-4 w-4" />
                        </label>
                        <label className="routine-select-control">
                            <select value={routineSort} onChange={(event) => setRoutineSort(event.target.value)} aria-label="Sort routines">
                                <option value="recent">Recent</option>
                                <option value="exercises">Exercises</option>
                                <option value="volume">Volume</option>
                                <option value="name">Name</option>
                            </select>
                            <ChevronDown className="h-4 w-4" />
                        </label>
                    </div>
                </div>

                {visibleRoutines.length ? (
                    <div className="routine-card-stack">
                        {visibleRoutines.map(({ routine, stats, preview, updatedLabel }) => (
                            <article className={`routine-pro-card hevy-routine-card ${stats.workouts ? "" : "is-empty"}`} key={routine._id}>
                                <div className="routine-card-cover">
                                    <p className="routines-eyebrow">Routine</p>
                                    <h3>{routine.name}</h3>
                                </div>
                                <div className="hevy-routine-top">
                                    <div>
                                        <h3>{stats.workouts} {stats.workouts === 1 ? "exercise" : "exercises"}</h3>
                                        <p>{preview}</p>
                                    </div>
                                    <div className="hevy-routine-menu-wrap">
                                        <button
                                            type="button"
                                            className="hevy-menu-button"
                                            onClick={() => setOpenMenuId((current) => current === routine._id ? null : routine._id)}
                                            aria-label={`Open ${routine.name} actions`}
                                        >
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                        {openMenuId === routine._id && (
                                            <div className="hevy-routine-menu">
                                                <button type="button" onClick={() => {
                                                    setRoutineError(null);
                                                    setOpenMenuId(null);
                                                    setRoutineModal({ mode: "edit", routine });
                                                }}>
                                                    <Edit3 className="h-4 w-4" />
                                                    Edit routine
                                                </button>
                                                <button type="button" className="danger" onClick={() => {
                                                    setOpenMenuId(null);
                                                    setDeleteTarget(routine);
                                                }}>
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete routine
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="hevy-routine-metrics">
                                    <span>{stats.totalSets} sets</span>
                                    <span>{formatLargeNumber(stats.totalVolume)} lb</span>
                                    <span>{updatedLabel}</span>
                                </div>
                                <div className="hevy-routine-footer">
                                    <div className="hevy-muscle-row">
                                        <span><Target className="h-4 w-4" /> {stats.muscleCoverage.slice(0, 3).join(", ") || "Unmapped"}</span>
                                        <span><Clock3 className="h-4 w-4" /> {stats.cardioCount ? `${stats.cardioCount} cardio` : stats.workouts ? "Strength" : "Ready"}</span>
                                    </div>
                                    <button type="button" className="hevy-start-button" onClick={() => navigate(`/routines/${routine._id}`)}>
                                        <PlayCircle className="h-4 w-4" />
                                        Open
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="routine-empty-state">
                        <CalendarCheck className="h-8 w-8" />
                        <h3>{routineList.length ? "No routines match" : "Create your first routine"}</h3>
                        <p>{routineList.length ? "Try a different search or filter." : "Pick a template or start with a blank plan."}</p>
                        <button type="button" className="routine-primary-button" onClick={() => openCreateModal()}>
                            <Plus className="h-4 w-4" />
                            New Routine
                        </button>
                    </div>
                )}
            </section>
            </>
            ) : (
            <section className="routine-challenge-board">
                <div className="routine-challenge-heading">
                    <div>
                        <p className="routines-eyebrow">Challenges</p>
                        <h2>Private challenge GCs</h2>
                        <span>Invite a few friends, keep the leaderboard honest, and keep the chat attached to the goal.</span>
                    </div>
                    <div className="challenge-view-tabs" aria-label="Challenge sections">
                        <button type="button" className={activeChallengeView === "groups" ? "active" : ""} onClick={() => setActiveChallengeView("groups")}>
                            <MessageSquare className="h-4 w-4" />
                            Groups
                        </button>
                        <button type="button" className={activeChallengeView === "create" ? "active" : ""} onClick={() => setActiveChallengeView("create")}>
                            <Plus className="h-4 w-4" />
                            Create
                        </button>
                    </div>
                </div>

                {activeChallengeView === "groups" ? (
                    <div className="challenge-lobby-layout">
                        <section className="challenge-lobby-list-panel">
                            <div className="challenge-section-heading">
                                <div>
                                    <p className="routines-eyebrow">Your groups</p>
                                    <h3>Challenge GCs</h3>
                                </div>
                                <span>{challengeGroups.length} active</span>
                            </div>
                            <div className="challenge-lobby-list">
                                {challengeGroups.map(({ id, title, status, objective, metric, duration, members, unread, icon: Icon, tone }) => (
                                    <button
                                        key={id}
                                        type="button"
                                        className={`challenge-lobby-card tone-${tone} ${selectedChallenge.id === id ? "active" : ""}`}
                                        onClick={() => setSelectedChallengeId(id)}
                                    >
                                        <span className="challenge-lobby-icon">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <span className="challenge-lobby-copy">
                                            <small>{status} / {duration}</small>
                                            <strong>{title}</strong>
                                            <em>{objective}</em>
                                        </span>
                                        <span className="challenge-lobby-meta">
                                            <b>{metric}</b>
                                            <i>{members.length} invited</i>
                                        </span>
                                        <span className="challenge-member-stack" aria-label={`${title} members`}>
                                            {members.slice(0, 4).map((member) => (
                                                <i key={`${id}-${member}`}>{member[0]}</i>
                                            ))}
                                        </span>
                                        {unread > 0 && <span className="challenge-unread">{unread}</span>}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className={`challenge-room-panel ${expandedChallengeChatId === selectedChallenge.id ? "chat-open" : ""}`}>
                            <div className="challenge-room-header">
                                <div>
                                    <p className="routines-eyebrow">{selectedChallenge.status} GC</p>
                                    <h3>{selectedChallenge.title}</h3>
                                    <span>{selectedChallenge.objective}</span>
                                </div>
                                <div className="challenge-room-header-actions">
                                    <button type="button" className="secondary">
                                        <Plus className="h-4 w-4" />
                                        Invite
                                    </button>
                                </div>
                            </div>

                            {expandedChallengeChatId === selectedChallenge.id ? (
                                <section className="challenge-chat-window" aria-label={`${selectedChallenge.title} messages`}>
                                    <div className="challenge-chat-window-header">
                                        <button type="button" onClick={() => setExpandedChallengeChatId(null)}>
                                            <ArrowLeft className="h-4 w-4" />
                                            Leaderboard
                                        </button>
                                        <span>{selectedChallenge.members.length} friends</span>
                                    </div>
                                    <div className="challenge-chat-window-body">
                                        {selectedChallengeMessages.map((message, index) => (
                                            <div
                                                key={`${selectedChallenge.id}-message-${message.name}-${message.text}-${index}`}
                                                className={`challenge-chat-bubble-row ${message.name === "You" ? "from-you" : ""}`}
                                            >
                                                {message.name !== "You" && <span>{message.name[0]}</span>}
                                                <div>
                                                    {getMemberProfileRoute(message.name) ? (
                                                        <Link to={getMemberProfileRoute(message.name)} className="challenge-profile-link">
                                                            {message.name}
                                                        </Link>
                                                    ) : (
                                                        <strong>{message.name}</strong>
                                                    )}
                                                    <p>{message.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <form className="challenge-chat-composer" onSubmit={handleChallengeMessageSubmit}>
                                        <input
                                            value={selectedChallengeDraft}
                                            onChange={(event) =>
                                                setChallengeChatDrafts((currentDrafts) => ({
                                                    ...currentDrafts,
                                                    [selectedChallenge.id]: event.target.value,
                                                }))
                                            }
                                            placeholder={`Message ${selectedChallenge.title}`}
                                        />
                                        <button type="submit" aria-label={`Send message to ${selectedChallenge.title}`}>
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </form>
                                </section>
                            ) : (
                                <button
                                    type="button"
                                    className="challenge-chat-banner"
                                    onClick={() => setExpandedChallengeChatId(selectedChallenge.id)}
                                >
                                    <span className="challenge-chat-banner-icon">
                                        <MessageSquare className="h-5 w-5" />
                                    </span>
                                    <span className="challenge-chat-banner-copy">
                                        <small>{selectedChallenge.unread} unread / {selectedChallenge.members.length} friends</small>
                                        <strong>Open challenge chat</strong>
                                        <em>{latestChallengeMessage ? `${latestChallengeMessage.name}: ${latestChallengeMessage.text}` : "No messages yet"}</em>
                                    </span>
                                    <span className="challenge-chat-banner-members">
                                        {selectedChallenge.members.slice(0, 5).map((member) => (
                                            <b key={`${selectedChallenge.id}-banner-member-${member}`}>{member[0]}</b>
                                        ))}
                                    </span>
                                </button>
                            )}

                            {expandedChallengeChatId !== selectedChallenge.id && (
                                <section className="challenge-live-panel challenge-leaderboard-panel">
                                    <div className="challenge-leaderboard-hero">
                                        <div>
                                            <p className="routines-eyebrow">Leaderboard</p>
                                            <h3>{selectedChallenge.metric}</h3>
                                            <span>{selectedChallenge.duration} / {selectedChallenge.finish}</span>
                                        </div>
                                        <div className="challenge-proof-pill">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span>{selectedChallenge.proof}</span>
                                        </div>
                                    </div>

                                    <div className="challenge-rule-row">
                                        {selectedChallenge.guardrails.map((rule) => (
                                            <span key={rule}><ShieldCheck className="h-3.5 w-3.5" /> {rule}</span>
                                        ))}
                                    </div>

                                    <div className="challenge-leaderboard-list is-full">
                                        {selectedLeaderboard.map((person, index) => (
                                            <div key={`${selectedChallenge.id}-${person.name}`}>
                                                <span className={index === 0 ? "is-first" : ""}>{index === 0 ? <Crown className="h-4 w-4" /> : index + 1}</span>
                                                <div>
                                                    {getMemberProfileRoute(person.name) ? (
                                                        <Link to={getMemberProfileRoute(person.name)} className="challenge-profile-link">
                                                            {person.name}
                                                        </Link>
                                                    ) : (
                                                        <strong>{person.name}</strong>
                                                    )}
                                                    <small>{person.delta}</small>
                                                </div>
                                                <b>{person.value}</b>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </section>
                    </div>
                ) : (
                    <div className="challenge-create-layout">
                        <section className="challenge-create-panel">
                            <div className="challenge-section-heading">
                                <div>
                                    <p className="routines-eyebrow">Create</p>
                                    <h3>New challenge GC</h3>
                                </div>
                                <button type="button" onClick={() => setChallengeSetupModal({ title: "Custom challenge", objective: "", metric: "" })}>
                                    <Plus className="h-4 w-4" />
                                    Setup
                                </button>
                            </div>
                            <div className="challenge-create-checklist">
                                {[
                                    { label: "Friends", value: "Invite the people in the GC" },
                                    { label: "Goal", value: "What the group is trying to finish" },
                                    { label: "Objective", value: "The measurable action or outcome" },
                                    { label: "Leaderboard", value: "How the group is ranked" },
                                    { label: "Guardrails", value: "Caps, minimums, proof, and tie-breakers" },
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <ShieldCheck className="h-4 w-4" />
                                        <span>{label}</span>
                                        <p>{value}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {Object.entries(challengeLibraries).map(([libraryName, templates]) => (
                            <section className="challenge-template-library" key={libraryName}>
                                <div className="challenge-section-heading">
                                    <div>
                                        <p className="routines-eyebrow">{libraryName}</p>
                                        <h3>{libraryName === "preset" ? "Preset formats" : libraryName === "community" ? "Community formats" : "Saved group formats"}</h3>
                                    </div>
                                    <span>{templates.length}</span>
                                </div>
                                <div className="challenge-create-template-list">
                                    {templates.map(({ title, objective, metric, icon: Icon }) => (
                                        <button
                                            key={`${libraryName}-${title}`}
                                            type="button"
                                            onClick={() => setChallengeSetupModal({ title, objective, metric })}
                                        >
                                            <span>
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <div>
                                                <strong>{title}</strong>
                                                <small>{objective}</small>
                                            </div>
                                            <b>{metric}</b>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </section>
            )}

            {challengeSetupModal && (
                <div className="exercise-modal-backdrop" role="dialog" aria-modal="true">
                    <form className="challenge-setup-modal" onSubmit={(event) => event.preventDefault()}>
                        <div className="exercise-modal-header">
                            <div>
                                <p className="routines-eyebrow">Create challenge</p>
                                <h2>{challengeSetupModal.title}</h2>
                                <span>Set the invited friends, scoring, finish condition, proof, and guardrails before the GC starts.</span>
                            </div>
                            <button type="button" className="routine-icon-button" onClick={() => setChallengeSetupModal(null)} aria-label="Close challenge setup">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="challenge-setup-grid">
                            {challengeSetupFields.map(({ label, value }) => (
                                <label key={label}>
                                    <span>{label}</span>
                                    <input value={value} readOnly />
                                </label>
                            ))}
                        </div>
                        <div className="challenge-setup-guardrails">
                            <p className="routines-eyebrow">Guardrail presets</p>
                            <div>
                                {["Verified proof only", "Healthy rate limits", "Tie-breaker rule", "Manual review", "Minimum activity floor", "No unsafe scoring"].map((rule) => (
                                    <span key={rule}><ShieldCheck className="h-3.5 w-3.5" /> {rule}</span>
                                ))}
                            </div>
                        </div>
                        <div className="routine-form-actions">
                            <button type="button" className="routine-secondary-button" onClick={() => setChallengeSetupModal(null)}>Cancel</button>
                            <button type="button" className="routine-primary-button" onClick={() => setChallengeSetupModal(null)}>Create group</button>
                        </div>
                    </form>
                </div>
            )}

            {routineModal && (
                <RoutineModal
                    mode={routineModal.mode}
                    routine={routineModal.routine}
                    initialName={routineModal.initialName}
                    error={routineError}
                    onClose={() => {
                        setRoutineModal(null);
                        setRoutineError(null);
                    }}
                    onSubmit={routineModal.mode === "edit" ? handleUpdateRoutine : handleCreateRoutine}
                />
            )}

            {deleteTarget && (
                <div className="exercise-modal-backdrop" role="dialog" aria-modal="true">
                    <div className="routine-name-modal routine-delete-modal">
                        <div className="exercise-modal-header">
                            <div className="routine-delete-heading">
                                <span className="routine-delete-icon">
                                    <Trash2 className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="routines-eyebrow">Delete routine</p>
                                    <h2>{deleteTarget.name}</h2>
                                </div>
                            </div>
                            <button type="button" className="routine-icon-button" onClick={() => setDeleteTarget(null)} aria-label="Cancel delete">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="delete-copy">This removes the routine and cannot be undone.</p>
                        <div className="routine-form-actions">
                            <button type="button" className="routine-secondary-button" onClick={() => setDeleteTarget(null)}>Cancel</button>
                            <button type="button" className="routine-danger-button" onClick={handleDeleteRoutine}>Delete routine</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Routines;
