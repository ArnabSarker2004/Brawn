import { exerciseDatabase } from "../data/exerciseDatabase";

export const normalizeExerciseText = (value = "") => value.toString().toLowerCase().trim();

export const titleMatchesExercise = (title, exercise) => {
    const normalizedTitle = normalizeExerciseText(title);
    const names = [exercise.name, ...(exercise.aliases || [])].map(normalizeExerciseText);

    return names.some((name) => {
        const tokens = name.split(/\s+/).filter((token) => token.length > 2);
        return normalizedTitle.includes(name) || tokens.every((token) => normalizedTitle.includes(token));
    });
};

export const getWorkoutVolume = (workout) =>
    workout?.sets?.reduce((total, set) => {
        const weight = Number(set.weight || 0);
        const reps = Number(set.reps || 0);
        return total + weight * reps;
    }, 0) || 0;

export const getWorkoutTime = (workout) =>
    workout?.sets?.reduce((total, set) => total + Number(set.time || 0), 0) || 0;

export const formatLargeNumber = (value) => {
    if (!value) return "0";
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${Math.round(value / 100) / 10}k`;
    return `${Math.round(value)}`;
};

export const formatWorkoutTime = (time) => {
    if (!time && time !== 0) return "";

    const timeString = time.toString().padStart(6, "0");
    const hours = parseInt(timeString.slice(0, 2), 10);
    const minutes = parseInt(timeString.slice(2, 4), 10);
    const seconds = parseInt(timeString.slice(4, 6), 10);
    const parts = [];

    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(" ");
};

const getFallbackExercise = (workout = {}) => {
    const title = workout.title || "Custom Exercise";
    const isCardio = !!workout.cardio;
    const isTimed = !!workout.timeBased;

    return {
        id: `custom-${normalizeExerciseText(title).replace(/\s+/g, "-") || "exercise"}`,
        name: title,
        category: isCardio ? "Cardio" : isTimed ? "Conditioning" : "Strength",
        equipment: "Custom",
        difficulty: "Logged",
        primaryMuscles: isCardio ? ["Heart"] : ["Full Body"],
        secondaryMuscles: isCardio ? ["Quads", "Calves"] : ["Core"],
        aliases: [title],
        tags: isCardio ? ["cardio", "conditioning"] : ["custom", "routine", "strength"],
        tutorial: [
            "Set up the movement with a stable position and controlled tempo.",
            "Use the first set to confirm range of motion, load, and form quality.",
            "Keep reps smooth and stop the set before technique breaks.",
            "Record notes after the set so Brawn can build better history around it.",
        ],
        cues: [
            "Move with control from the first rep.",
            "Keep breathing steady through the hardest part.",
            "Match the load or time to the goal of the session.",
        ],
        mistakes: [
            "Adding intensity before the pattern is consistent.",
            "Skipping warm-up reps.",
            "Letting the final reps get sloppy.",
        ],
        isCustom: true,
    };
};

export const getExerciseForWorkout = (workout = {}) => {
    const match = exerciseDatabase.find((exercise) => titleMatchesExercise(workout.title, exercise));
    return match || getFallbackExercise(workout);
};

export const getExerciseMatchesFromWorkouts = (exercise, workouts = []) =>
    workouts.filter((workout) => titleMatchesExercise(workout.title, exercise));

export const getExerciseHistoryStats = (exercise, workouts = []) => {
    const matches = getExerciseMatchesFromWorkouts(exercise, workouts);
    const allSets = matches.flatMap((workout) =>
        (workout.sets || []).map((set, index) => ({ ...set, index, workout }))
    );
    const totalSets = allSets.length;
    const totalVolume = matches.reduce((total, workout) => total + getWorkoutVolume(workout), 0);
    const totalTime = matches.reduce((total, workout) => total + getWorkoutTime(workout), 0);
    const bestWeight = allSets.reduce((best, set) => Math.max(best, Number(set.weight || 0)), 0);
    const bestReps = allSets.reduce((best, set) => Math.max(best, Number(set.reps || 0)), 0);
    const bestTime = allSets.reduce((best, set) => Math.max(best, Number(set.time || 0)), 0);

    return {
        allSets,
        matches,
        totalSets,
        totalVolume,
        totalTime,
        bestWeight,
        bestReps,
        bestTime,
    };
};
