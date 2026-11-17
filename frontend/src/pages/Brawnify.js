import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Bot,
    CalendarCheck,
    ClipboardList,
    Dumbbell,
    FilePenLine,
    Flame,
    ListChecks,
    Loader2,
    MessageCircle,
    Plus,
    RefreshCw,
    Search,
    Send,
    Sparkles,
    Target,
    Trash2,
    Trophy,
    UserRound,
    Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Brawnify.css";

const API_KEY = process.env.REACT_APP_OPEN_AI;
const URL =
    process.env.NODE_ENV === "production"
        ? "https://brawn-tedx.onrender.com"
        : "http://localhost:4000";

const actionModes = {
    "new-routine": {
        label: "New routine",
        title: "Create routine",
        hint: "Build a structured program from your goal, schedule, equipment, and weak points.",
        placeholder: "4-day upper/lower hypertrophy, shoulder emphasis, 75 minutes, gym equipment",
        icon: ClipboardList,
        needsRoutine: false,
    },
    "update-routine": {
        label: "Update routine",
        title: "Update routine",
        hint: "Revise the selected routine while preserving useful exercises and improving weak spots.",
        placeholder: "Make this more hypertrophy focused, reduce axial fatigue, keep sessions under 70 minutes",
        icon: RefreshCw,
        needsRoutine: true,
    },
    "add-workout": {
        label: "Add exercise",
        title: "Add exercise",
        hint: "Add one exercise with sets, reps, and the right cardio/time-based flags.",
        placeholder: "Lengthened-biased rear delt isolation with moderate load",
        icon: Plus,
        needsRoutine: true,
    },
    injury: {
        label: "Injury workaround",
        title: "Work around pain or injury",
        hint: "Get substitutions, load reductions, return-to-training steps, and red flags.",
        placeholder: "My right shoulder hurts on incline press. Modify this routine for 2 weeks.",
        icon: AlertTriangle,
        needsRoutine: false,
    },
    advice: {
        label: "Ask Brawnify",
        title: "Ask Brawnify",
        hint: "Use your profile and current routines as context for direct coaching advice.",
        placeholder: "How should I progress load when my last set lands around 2 RIR?",
        icon: MessageCircle,
        needsRoutine: false,
    },
    competition: {
        label: "Competition",
        title: "Competition lab",
        hint: "Build social challenges for cuts, gains, streaks, and volume races.",
        placeholder: "Create a 6-week fat loss challenge with weekly weigh-ins, streak scoring, and workout targets",
        icon: Trophy,
        needsRoutine: false,
    },
    "delete-routine": {
        label: "Delete routine",
        title: "Delete selected routine",
        hint: "Remove a routine you no longer use. This cannot be undone.",
        placeholder: "Type DELETE to confirm removing the selected routine",
        icon: Trash2,
        needsRoutine: true,
        destructive: true,
    },
};

const starterPrompts = [
    "3-day full-body hypertrophy for a newer lifter, machines and dumbbells, 60 minutes",
    "5-day push/pull/legs with arms specialization and 1-2 RIR accessories",
    "Lower strength block with posterior chain emphasis and less knee irritation",
    "Upper/lower recomposition plan with Zone 2 finishers twice per week",
];

const defaultMessages = [
    {
        user: "Brawnify",
        content: "What are we building today?",
    },
];

const profileLine = (body) => {
    if (!body) return "No profile data yet";
    const parts = [
        body.Gender && `Gender: ${body.Gender}`,
        body.Weight && `Weight: ${body.Weight}`,
        body.Height && `Height: ${body.Height}`,
        body.YearsOfWorkoutExperience && `Experience: ${body.YearsOfWorkoutExperience} years`,
        Number.isFinite(Number(body.CurrentWorkoutStreak)) && `Streak: ${body.CurrentWorkoutStreak} days`,
        Number.isFinite(Number(body.TotalWorkouts)) && `Logged: ${body.TotalWorkouts} workouts`,
    ].filter(Boolean);

    return parts.length ? parts.join(" | ") : "Profile loaded";
};

const profileStats = (body) => {
    if (!body) return [{ label: "Profile", value: "No data yet" }];

    return [
        body.Gender && { label: "Gender", value: body.Gender },
        body.Weight && { label: "Weight", value: body.Weight },
        body.Height && { label: "Height", value: body.Height },
        body.YearsOfWorkoutExperience && { label: "Experience", value: `${body.YearsOfWorkoutExperience} years` },
        Number.isFinite(Number(body.CurrentWorkoutStreak)) && { label: "Streak", value: `${body.CurrentWorkoutStreak} days` },
        Number.isFinite(Number(body.TotalWorkouts)) && { label: "Logged", value: `${body.TotalWorkouts} workouts` },
    ].filter(Boolean);
};

const getRoutineInitials = (name = "Routine") =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

const stripCodeFence = (value = "") =>
    value
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

const parseJsonResponse = (value) => {
    const cleaned = stripCodeFence(value);
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    const jsonText = firstBrace >= 0 && lastBrace >= firstBrace ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned;

    return JSON.parse(jsonText);
};

const cleanGeneratedName = (value = "", fallback = "Hypertrophy Mesocycle") => {
    const banned = /\b(blast|beast|savage|insane|annihilator|shredder|crusher|killer|jeff|nippard|hussein|farhat)\b/gi;
    const cleaned = value
        .replace(/["']/g, "")
        .replace(banned, "")
        .replace(/\s{2,}/g, " ")
        .trim();

    return cleaned || fallback;
};

const normalizeSets = (sets = [], fallbackReps = 8) =>
    Array.from({ length: 3 }, (_, index) => {
        const source = sets[index] || {};
        return {
            weight: Number(source.weight || 0),
            reps: Number(source.reps || fallbackReps),
            time: Number(source.time || 0),
        };
    });

const normalizeWorkout = (workout = {}, fallbackTitle = "Technical Exercise") => {
    const cardio = Boolean(workout.cardio);
    const timeBased = Boolean(workout.timeBased);

    return {
        title: cleanGeneratedName(workout.title, fallbackTitle),
        cardio,
        timeBased,
        sets: normalizeSets(workout.sets, cardio || timeBased ? 0 : 8),
    };
};

const summarizeRoutine = (routine) => {
    if (!routine) return "No routine selected.";
    const workouts = routine.workouts || [];
    const exerciseList = workouts
        .slice(0, 10)
        .map((workout) => {
            const sets = workout.sets || [];
            const setText = sets.length
                ? sets.map((set) => `${set.weight || 0}x${set.reps || 0}${set.time ? `/${set.time}s` : ""}`).join(", ")
                : "no sets";
            return `- ${workout.title} (${setText})`;
        })
        .join("\n");

    return `${routine.name}
Exercises: ${workouts.length}
Completed: ${routine.completionStats?.length || 0} times
${exerciseList || "No exercises yet."}`;
};

const summarizeAllRoutines = (routines) =>
    routines.length
        ? routines
              .slice(0, 8)
              .map((routine) => `${routine.name}: ${(routine.workouts || []).map((workout) => workout.title).slice(0, 6).join(", ") || "empty"}`)
              .join("\n")
        : "No existing routines.";

const buildRoutinePrompt = ({ description, routineName, body, routines }) => `
Create a production-ready workout routine from this request: "${description}".

Athlete context: ${profileLine(body)}.
Existing routine context:
${summarizeAllRoutines(routines)}

Rules:
- Routine name must be "${routineName}" unless it is unsafe or inaccurate.
- Use professional program language, not gimmicks.
- Do not imitate or mention any real coach, influencer, or brand.
- Use useful training terms only when they clarify the plan: RIR, top set, back-off, lengthened-biased, specialization block, tempo.
- 6 to 8 exercises unless the user requests a shorter session.
- Exactly 3 sets per exercise.
- Heavy compounds: 5-8 reps.
- Accessories: 8-15 reps.
- Isolation/pump work: 12-20 reps.
- Cardio/time-based exercises must set cardio or timeBased correctly.

Return only valid JSON:
{
  "name": "${routineName}",
  "workouts": [
    { "title": "string", "timeBased": false, "cardio": false, "sets": [{ "weight": 0, "reps": 8, "time": 0 }] }
  ]
}
`;

const buildUpdatePrompt = ({ description, routine, body }) => `
Update this existing routine based on the request: "${description}".

Athlete context: ${profileLine(body)}.
Current routine:
${summarizeRoutine(routine)}

Rules:
- Preserve useful exercises when they still fit the request.
- Improve exercise order, fatigue management, gaps, and progression quality.
- If the user mentions pain, reduce aggravating movements and include safer substitutions.
- Use professional technical names, not gimmicks.
- Do not mention or imitate real coaches.
- Return the complete updated routine with exactly 3 sets per exercise.

Return only valid JSON:
{
  "name": "string",
  "workouts": [
    { "title": "string", "timeBased": false, "cardio": false, "sets": [{ "weight": 0, "reps": 8, "time": 0 }] }
  ]
}
`;

const buildWorkoutPrompt = ({ description, routineName, workoutName, routine }) => `
Create one exercise entry for "${routineName}" from this request: "${description}".

Routine context:
${summarizeRoutine(routine)}

Use a precise technical exercise name. Avoid gimmicks and do not mention real coaches.
The title should be "${workoutName}" unless unsafe or inaccurate.
Use exactly 3 sets.

Return only valid JSON:
{ "title": "${workoutName}", "timeBased": false, "cardio": false, "sets": [{ "weight": 0, "reps": 8, "time": 0 }] }
`;

const buildAdvicePrompt = ({ question, body, routines, routine }) => `
You are Brawnify, an evidence-based training assistant inside a workout app.
Answer this athlete question: "${question}".

Athlete context: ${profileLine(body)}.
Selected routine context:
${summarizeRoutine(routine)}

All routine context:
${summarizeAllRoutines(routines)}

Be practical and concise. If pain or injury is involved, include:
- what to stop or reduce now
- safer substitutions
- return-to-training progression
- red flags that should prompt medical care
Do not diagnose. Do not imitate or reference real coaches.
`;

const buildCompetitionPrompt = ({ question, body, routines, routine }) => `
You are Brawnify, an evidence-based social fitness competition designer inside a workout app.
Create a polished challenge from this request: "${question}".

Athlete context: ${profileLine(body)}.
Selected routine context:
${summarizeRoutine(routine)}

All routine context:
${summarizeAllRoutines(routines)}

Return a practical challenge format with:
- challenge name
- goal and duration
- scoring rules
- weekly targets
- safety guardrails
- what to post or track in a social feed
- tie-breakers and completion badges

Keep it concise and professional. Do not promote unsafe weight loss or extreme behaviors.
`;

function Brawnify() {
    const { user } = useAuth();
    const [body, setBody] = useState(null);
    const [messages, setMessages] = useState(defaultMessages);
    const [loading, setLoading] = useState(false);
    const [routines, setRoutines] = useState([]);
    const [activeMode, setActiveMode] = useState("new-routine");
    const [selectedRoutine, setSelectedRoutine] = useState("");
    const [routineSearch, setRoutineSearch] = useState("");
    const [userInput, setUserInput] = useState("");
    const [error, setError] = useState("");
    const messagesEndRef = useRef(null);
    const activeConfig = actionModes[activeMode];
    const selectedRoutineData = useMemo(
        () => routines.find((routine) => routine._id === selectedRoutine) || null,
        [routines, selectedRoutine]
    );
    const profileMetricList = useMemo(() => profileStats(body), [body]);
    const selectedRoutineStats = useMemo(() => {
        if (!selectedRoutineData) {
            return [
                { label: "Exercises", value: "0", icon: Dumbbell },
                { label: "Sets", value: "0", icon: ListChecks },
                { label: "Logged", value: "0", icon: CalendarCheck },
            ];
        }

        const workouts = selectedRoutineData.workouts || [];
        const setCount = workouts.reduce((total, workout) => total + (workout.sets?.length || 0), 0);

        return [
            { label: "Exercises", value: workouts.length, icon: Dumbbell },
            { label: "Sets", value: setCount, icon: ListChecks },
            { label: "Logged", value: selectedRoutineData.completionStats?.length || 0, icon: CalendarCheck },
        ];
    }, [selectedRoutineData]);
    const routinePreview = useMemo(() => {
        if (!selectedRoutineData?.workouts?.length) return [];
        return selectedRoutineData.workouts.slice(0, 5).map((workout) => workout.title);
    }, [selectedRoutineData]);
    const competitionCards = useMemo(
        () => [
            {
                title: "Cut ladder",
                metric: "8 weeks",
                detail: "Weight, streaks, posts",
                icon: ArrowDownRight,
                tone: "cut",
                prompt: "Create an 8-week fat loss competition with safe weekly targets, weigh-in rules, workout streak scoring, and social feed check-ins.",
            },
            {
                title: "Lean gain",
                metric: "12 weeks",
                detail: "Volume, PRs, nutrition",
                icon: ArrowUpRight,
                tone: "gain",
                prompt: "Create a 12-week lean gain competition with hypertrophy volume scoring, strength PR bonuses, and nutrition compliance tracking.",
            },
            {
                title: "Streak race",
                metric: "30 days",
                detail: "Training consistency",
                icon: Flame,
                tone: "streak",
                prompt: "Create a 30-day workout streak race with rest-day rules, missed-day recovery rules, and leaderboard scoring.",
            },
            {
                title: "Squad battle",
                metric: "Teams",
                detail: "Friends leaderboard",
                icon: Users,
                tone: "squad",
                prompt: "Create a team-based fitness competition for friends with weekly team scoring, individual MVP badges, and feed prompts.",
            },
        ],
        []
    );
    const visibleRoutines = useMemo(() => {
        const query = routineSearch.trim().toLowerCase();
        if (!query) return routines;

        return routines.filter((routine) => {
            const exerciseText = (routine.workouts || []).map((workout) => workout.title).join(" ");
            return `${routine.name} ${exerciseText}`.toLowerCase().includes(query);
        });
    }, [routineSearch, routines]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        const fetchRoutines = async () => {
            try {
                const response = await fetch(`${URL}/api/routines`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });
                const data = response.ok ? await response.json() : [];
                const routineList = Array.isArray(data) ? data : [];
                setRoutines(routineList);
                setSelectedRoutine((current) => current || routineList[0]?._id || "");
            } catch (fetchError) {
                console.error("Error fetching routines:", fetchError);
            }
        };

        const getUserdata = async () => {
            if (!user) return;
            try {
                const response = await fetch(`${URL}/api/user/getbodyinfo`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: user }),
                    credentials: "include",
                });
                if (response.ok) setBody(await response.json());
            } catch {
                console.log("No profile information found");
            }
        };

        fetchRoutines();
        getUserdata();
    }, [user]);

    const fetchBrawnifyResponse = async (message) => {
        if (!API_KEY) {
            throw new Error("Missing REACT_APP_OPEN_AI. Add the key or route Brawnify requests through the backend.");
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                temperature: 0.4,
                messages: [{ role: "user", content: message }],
            }),
        });

        const responseBody = await response.json();
        if (!response.ok) {
            throw new Error(responseBody?.error?.message || "Brawnify request failed.");
        }

        return responseBody.choices?.[0]?.message?.content || "";
    };

    const handleCreateRoutine = async (routineData) => {
        const response = await fetch(`${URL}/api/routines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(routineData),
            credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data?.error || "Failed to create routine.");

        setRoutines((prevRoutines) => [data, ...prevRoutines]);
        setSelectedRoutine(data._id);
        return data;
    };

    const handleUpdateRoutine = async (routineId, routineData) => {
        const response = await fetch(`${URL}/api/routines/${routineId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(routineData),
            credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data?.error || "Failed to update routine.");

        setRoutines((prevRoutines) =>
            prevRoutines.map((routine) => (routine._id === routineId ? data : routine))
        );
        return data;
    };

    const handleDeleteRoutine = async (routineId) => {
        const response = await fetch(`${URL}/api/routines/${routineId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data?.error || "Failed to delete routine.");

        setRoutines((prevRoutines) => {
            const nextRoutines = prevRoutines.filter((routine) => routine._id !== routineId);
            setSelectedRoutine(nextRoutines[0]?._id || "");
            return nextRoutines;
        });
        return data;
    };

    const handleAddWorkout = async (routineId, workoutData) => {
        const response = await fetch(`${URL}/api/routines/${routineId}/workouts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(workoutData),
            credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data?.error || "Failed to add exercise.");

        setRoutines((prevRoutines) =>
            prevRoutines.map((routine) =>
                routine._id === routineId
                    ? { ...routine, workouts: [...(routine.workouts || []), data] }
                    : routine
            )
        );
        return data;
    };

    const submitStarter = (prompt, modeId = "new-routine") => {
        setActiveMode(modeId);
        setUserInput(prompt);
        setError("");
    };

    const selectMode = (modeId) => {
        setActiveMode(modeId);
        setError("");
        if (modeId === "delete-routine") setUserInput("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmedInput = userInput.trim();
        if (loading) return;
        if (!trimmedInput) return;
        if (activeConfig.needsRoutine && !selectedRoutineData) {
            setError("Select a routine first.");
            return;
        }

        setLoading(true);
        setError("");
        setMessages((currentMessages) => [
            ...currentMessages,
            { user: "You", content: trimmedInput },
        ]);

        try {
            if (activeMode === "delete-routine") {
                if (trimmedInput !== "DELETE") {
                    throw new Error("Type DELETE to confirm routine removal.");
                }
                const deletedRoutine = await handleDeleteRoutine(selectedRoutineData._id);
                setMessages((currentMessages) => [
                    ...currentMessages,
                    { user: "Brawnify", content: `Deleted "${deletedRoutine.name}".` },
                ]);
                setUserInput("");
                return;
            }

            if (activeMode === "new-routine") {
                const nameResponse = await fetchBrawnifyResponse(
                    `Generate one concise professional workout routine name for this request: "${trimmedInput}". Use naming like "Upper Hypertrophy A", "Lower Strength + Posterior Chain", "Full-Body Recomp Block", or "Pull Volume Specialization". Avoid gimmicks, celebrity names, and hype words. Return only the name.`
                );
                const routineName = cleanGeneratedName(nameResponse, "Hypertrophy Mesocycle");
                const routineResponse = await fetchBrawnifyResponse(buildRoutinePrompt({
                    description: trimmedInput,
                    routineName,
                    body,
                    routines,
                }));
                const routineData = parseJsonResponse(routineResponse);
                const normalizedRoutine = {
                    name: cleanGeneratedName(routineData.name, routineName),
                    workouts: (routineData.workouts || []).map((workout, index) =>
                        normalizeWorkout(workout, `Exercise ${index + 1}`)
                    ),
                };
                const createdRoutine = await handleCreateRoutine(normalizedRoutine);

                setMessages((currentMessages) => [
                    ...currentMessages,
                    { user: "Brawnify", content: `Created "${createdRoutine.name}" with ${createdRoutine.workouts?.length || 0} exercises.` },
                ]);
            }

            if (activeMode === "update-routine") {
                const routineResponse = await fetchBrawnifyResponse(buildUpdatePrompt({
                    description: trimmedInput,
                    routine: selectedRoutineData,
                    body,
                }));
                const routineData = parseJsonResponse(routineResponse);
                const normalizedRoutine = {
                    name: cleanGeneratedName(routineData.name, selectedRoutineData.name),
                    workouts: (routineData.workouts || []).map((workout, index) =>
                        normalizeWorkout(workout, `Exercise ${index + 1}`)
                    ),
                };
                const updatedRoutine = await handleUpdateRoutine(selectedRoutineData._id, normalizedRoutine);

                setMessages((currentMessages) => [
                    ...currentMessages,
                    { user: "Brawnify", content: `Updated "${updatedRoutine.name}" with ${updatedRoutine.workouts?.length || 0} programmed exercises.` },
                ]);
            }

            if (activeMode === "add-workout") {
                const nameResponse = await fetchBrawnifyResponse(
                    `Generate one precise exercise name for this request: "${trimmedInput}". Routine context: "${selectedRoutineData.name}". Use technical naming, 2-5 words, no gimmicks and no celebrity references. Return only the exercise name.`
                );
                const workoutName = cleanGeneratedName(nameResponse, "Technical Exercise");
                const workoutResponse = await fetchBrawnifyResponse(buildWorkoutPrompt({
                    description: trimmedInput,
                    routineName: selectedRoutineData.name,
                    workoutName,
                    routine: selectedRoutineData,
                }));
                const workoutData = normalizeWorkout(parseJsonResponse(workoutResponse), workoutName);
                const createdWorkout = await handleAddWorkout(selectedRoutineData._id, workoutData);

                setMessages((currentMessages) => [
                    ...currentMessages,
                    { user: "Brawnify", content: `Added "${createdWorkout.title}" to "${selectedRoutineData.name}".` },
                ]);
            }

            if (activeMode === "injury" || activeMode === "advice" || activeMode === "competition") {
                const prompt = activeMode === "competition"
                    ? buildCompetitionPrompt({
                          question: trimmedInput,
                          body,
                          routines,
                          routine: selectedRoutineData,
                      })
                    : buildAdvicePrompt({
                          question: trimmedInput,
                          body,
                          routines,
                          routine: selectedRoutineData,
                      });
                const botResponse = await fetchBrawnifyResponse(prompt);
                setMessages((currentMessages) => [
                    ...currentMessages,
                    { user: "Brawnify", content: botResponse },
                ]);
            }

            setUserInput("");
        } catch (submitError) {
            console.error("Brawnify request failed:", submitError);
            setError(submitError.message || "Brawnify could not complete that request.");
            setMessages((currentMessages) => [
                ...currentMessages,
                { user: "Brawnify", content: submitError.message || "I could not finish that request. Try again with a clearer prompt." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const ActiveModeIcon = activeConfig.icon;

    return (
        <div className="brawnify-page brawnify-studio">
            <div className="brawnify-shell">
                <aside className="brawnify-action-rail" aria-label="Brawnify modes">
                    <div className="brawnify-brand-block">
                        <span className="brawnify-ai-mark">
                            <Bot className="h-6 w-6" />
                        </span>
                        <div>
                            <p className="brawnify-eyebrow">Brawnify</p>
                            <h1>Coach</h1>
                        </div>
                    </div>

                    <nav className="brawnify-mode-strip" aria-label="Brawnify actions">
                        {Object.entries(actionModes).map(([id, mode]) => {
                            const Icon = mode.icon;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    className={`${activeMode === id ? "active" : ""} ${mode.destructive ? "danger" : ""}`}
                                    onClick={() => selectMode(id)}
                                    title={mode.label}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{mode.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <main className="brawnify-workspace">
                    <header className="brawnify-workspace-header">
                        <div className="brawnify-active-action">
                            <span className={`brawnify-current-icon ${activeConfig.destructive ? "danger" : ""}`}>
                                <ActiveModeIcon className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="brawnify-eyebrow">{activeConfig.label}</p>
                                <h2>{activeConfig.title}</h2>
                            </div>
                        </div>

                        {activeConfig.needsRoutine && (
                            <label className="brawnify-routine-picker">
                                <span>Routine</span>
                                <select
                                    value={selectedRoutine}
                                    onChange={(event) => setSelectedRoutine(event.target.value)}
                                    aria-label="Select routine"
                                >
                                    <option value="">Select routine</option>
                                    {routines.map((routine) => (
                                        <option key={routine._id} value={routine._id}>
                                            {routine.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                    </header>

                    <section className="brawnify-messages" aria-label="Brawnify conversation">
                        {messages.map((message, index) => (
                            <div key={`${message.user}-${index}`} className={`brawnify-message ${message.user === "You" ? "mine" : ""}`}>
                                <span>{message.user}</span>
                                <p>{message.content}</p>
                            </div>
                        ))}
                        {loading && (
                            <div className="brawnify-message">
                                <span>Brawnify</span>
                                <p><Loader2 className="h-4 w-4 animate-spin" /> Working...</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </section>

                    <form className="brawnify-composer" onSubmit={handleSubmit}>
                        <div>
                            <textarea
                                value={userInput}
                                onChange={(event) => setUserInput(event.target.value)}
                                placeholder={activeConfig.placeholder}
                                rows={3}
                            />
                            <button type="submit" disabled={loading || !userInput.trim()} aria-label="Send to Brawnify">
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            </button>
                        </div>
                        {error && <p className="brawnify-error">{error}</p>}
                    </form>
                </main>

                <aside className="brawnify-side-panel">
                    <section className="brawnify-context-card brawnify-competition-card">
                        <div className="brawnify-panel-heading compact">
                            <Trophy className="h-5 w-5" />
                            <div>
                                <p className="brawnify-eyebrow">Competition</p>
                                <h2>Challenge lab</h2>
                            </div>
                        </div>
                        <div className="brawnify-competition-grid">
                            {competitionCards.map(({ title, metric, detail, icon: Icon, tone, prompt }) => (
                                <button key={title} type="button" className={`tone-${tone}`} onClick={() => submitStarter(prompt, "competition")}>
                                    <span>
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    <strong>{title}</strong>
                                    <small>{metric}</small>
                                    <em>{detail}</em>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="brawnify-context-card brawnify-routine-browser">
                        <div className="brawnify-panel-heading compact">
                            <Target className="h-5 w-5" />
                            <div>
                                <p className="brawnify-eyebrow">Routine</p>
                                <h2>{selectedRoutineData?.name || "Select routine"}</h2>
                            </div>
                        </div>

                        <div className="brawnify-mini-stat-grid">
                            {selectedRoutineStats.map(({ label, value, icon: Icon }) => (
                                <div key={label}>
                                    <Icon className="h-4 w-4" />
                                    <small>{label}</small>
                                    <b>{value}</b>
                                </div>
                            ))}
                        </div>

                        {routinePreview.length > 0 && (
                            <div className="brawnify-routine-preview">
                                {routinePreview.map((title) => (
                                    <span key={title}>{title}</span>
                                ))}
                            </div>
                        )}

                        <label className="brawnify-routine-search">
                            <Search className="h-4 w-4" />
                            <input
                                type="search"
                                value={routineSearch}
                                onChange={(event) => setRoutineSearch(event.target.value)}
                                placeholder="Search routines"
                            />
                        </label>

                        <div className="brawnify-routine-list" aria-label="Existing routines">
                            {visibleRoutines.length ? (
                                visibleRoutines.map((routine) => (
                                    <button
                                        key={routine._id}
                                        type="button"
                                        className={selectedRoutine === routine._id ? "active" : ""}
                                        onClick={() => setSelectedRoutine(routine._id)}
                                    >
                                        <span className="brawnify-routine-mark">{getRoutineInitials(routine.name)}</span>
                                        <span className="brawnify-routine-copy">
                                            <strong>{routine.name}</strong>
                                            <span>
                                                <b>{routine.workouts?.length || 0} exercises</b>
                                                <b>{routine.completionStats?.length || 0} logged</b>
                                            </span>
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <div className="brawnify-empty-context">
                                    <Dumbbell className="h-5 w-5" />
                                    <p>{routines.length ? "No routines match that search." : "No routines yet. Brawnify can build your first one."}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="brawnify-context-card brawnify-starters">
                        <div className="brawnify-panel-heading compact">
                            <Sparkles className="h-5 w-5" />
                            <div>
                                <p className="brawnify-eyebrow">Fast starts</p>
                                <h2>Prompt ideas</h2>
                            </div>
                        </div>
                        {starterPrompts.map((prompt) => (
                            <button key={prompt} type="button" onClick={() => submitStarter(prompt)}>
                                <FilePenLine className="h-4 w-4" />
                                {prompt}
                            </button>
                        ))}
                    </section>

                    <section className="brawnify-context-card brawnify-athlete-card">
                        <div className="brawnify-panel-heading compact">
                            <UserRound className="h-5 w-5" />
                            <div>
                                <p className="brawnify-eyebrow">Profile</p>
                                <h2>Athlete</h2>
                            </div>
                        </div>
                        <div className="brawnify-profile-grid">
                            {profileMetricList.map((stat) => (
                                <span key={stat.label}>
                                    <small>{stat.label}</small>
                                    <b>{stat.value}</b>
                                </span>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}

export default Brawnify;
