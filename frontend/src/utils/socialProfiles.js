const normalizeText = (value = "") =>
    value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/^@/, "")
        .replace(/\s+/g, ".");

export const normalizeProfileHandle = normalizeText;

export const getInitials = (name = "Athlete") =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

export const SOCIAL_PROFILES = [
    {
        id: "maya",
        name: "Maya Chen",
        handle: "maya.moves",
        aliases: ["maya", "maya chen"],
        initials: "MC",
        verified: true,
        tone: "pink",
        bio: "Lower-body strength blocks, cut challenges, and brutally honest leg-day receipts.",
        location: "Toronto",
        focus: "Lower body strength",
        followers: ["runwithjo", "sam.bulks", "liftwithnia", "brawn.coach", "alex.moves"],
        following: ["runwithjo", "sam.bulks", "brawn.coach"],
    },
    {
        id: "jordan",
        name: "Jordan Miles",
        handle: "runwithjo",
        aliases: ["jordan", "jordan miles"],
        initials: "JM",
        verified: false,
        tone: "blue",
        bio: "Routes, intervals, zone 2 patience, and the occasional post-run snack thesis.",
        location: "Waterfront loop",
        focus: "Running and conditioning",
        followers: ["maya.moves", "sam.bulks", "brawn.coach"],
        following: ["maya.moves", "alex.moves", "brawn.coach"],
    },
    {
        id: "sam",
        name: "Sam Patel",
        handle: "sam.bulks",
        aliases: ["sam", "sam patel"],
        initials: "SP",
        verified: false,
        tone: "gold",
        bio: "Bulk programming, heavy hinges, calorie math, and no-nonsense volume ladders.",
        location: "Rack 3",
        focus: "Bulk programming",
        followers: ["maya.moves", "runwithjo", "liftwithnia"],
        following: ["maya.moves", "runwithjo", "brawn.coach"],
    },
    {
        id: "coach",
        name: "Coach AI",
        handle: "brawn.coach",
        aliases: ["coach", "coach ai", "coach.ai", "brawn coach"],
        initials: "AI",
        verified: true,
        tone: "green",
        bio: "Technique cues, recovery nudges, and training signal without the motivational fog machine.",
        location: "Brawn lab",
        focus: "Technique cues",
        followers: ["maya.moves", "runwithjo", "sam.bulks", "liftwithnia", "alex.moves"],
        following: ["maya.moves", "runwithjo", "sam.bulks", "liftwithnia"],
    },
    {
        id: "nia",
        name: "Nia Brooks",
        handle: "liftwithnia",
        aliases: ["nia", "nia brooks"],
        initials: "NB",
        verified: true,
        tone: "violet",
        bio: "Push/pull splits, upper-body hypertrophy, pump work, and shoulder-friendly progressions.",
        location: "Studio A",
        focus: "Upper body hypertrophy",
        followers: ["maya.moves", "sam.bulks", "brawn.coach"],
        following: ["maya.moves", "brawn.coach"],
    },
    {
        id: "alex",
        name: "Alex Rivera",
        handle: "alex.moves",
        aliases: ["alex", "alex rivera"],
        initials: "AR",
        verified: false,
        tone: "orange",
        bio: "Meal prep, mobility streaks, and keeping challenge groups suspiciously organized.",
        location: "Meal prep HQ",
        focus: "Mobility and nutrition",
        followers: ["maya.moves", "runwithjo"],
        following: ["maya.moves", "runwithjo", "brawn.coach"],
    },
];

export const PUBLIC_PROFILE_POSTS = [
    {
        id: "seed-sam-hinge",
        name: "Sam Patel",
        handle: "sam.bulks",
        action: "Logged heavy hinge day",
        detail: "Top set, back-off volume, hamstring bias, then glute pump work.",
        stat: "21,880 lb",
        tag: "Workout",
        kind: "workout",
        tone: "gold",
        caption: "Heavy hinge day. The posterior chain invoice has been paid.",
        tags: ["Maya", "Alex"],
        likes: 212,
        saves: 39,
        reposts: 8,
        comments: [
            {
                id: "seed-sam-comment-1",
                author: "Coach AI",
                text: "Good position through the entire hinge.",
                createdAt: "2026-06-24T20:15:00.000Z",
            },
        ],
        slides: [
            {
                type: "photo",
                src: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=1100&q=80",
                alt: "Athlete deadlifting in a gym",
                label: "Top set",
            },
            {
                type: "workout",
                title: "Posterior chain block",
                duration: "62 min",
                volume: "21,880 lb",
                exercises: [
                    { name: "Deadlift", detail: "1 x 4 at 365 lb" },
                    { name: "Romanian deadlift", detail: "4 x 8 at 225 lb" },
                    { name: "Hamstring curl", detail: "3 x 12" },
                    { name: "Hip thrust", detail: "3 x 10 at 275 lb" },
                ],
            },
        ],
    },
    {
        id: "seed-coach-pulldown",
        name: "Coach AI",
        handle: "brawn.coach",
        action: "Shared a technique cue",
        detail: "Stack the ribs, control the stretch, and pull through the elbows.",
        stat: "12-15 reps",
        tag: "Technique",
        kind: "reel",
        tone: "green",
        caption: "Lengthened-biased pulldown cue: own the bottom, then let the lats do the loud part.",
        tags: ["Nia", "Sam"],
        likes: 1180,
        saves: 340,
        reposts: 91,
        comments: [
            {
                id: "seed-coach-comment-1",
                author: "Maya",
                text: "The stacked-rib cue fixed this immediately.",
                createdAt: "2026-06-25T09:20:00.000Z",
            },
        ],
        slides: [
            {
                type: "photo",
                src: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=1100&q=80",
                alt: "Cable machines in a gym",
                label: "Cue",
            },
        ],
    },
    {
        id: "seed-nia-push",
        name: "Nia Brooks",
        handle: "liftwithnia",
        action: "Posted push-day top set",
        detail: "Incline press top set with a clean back-off target.",
        stat: "2 RIR",
        tag: "Reel",
        kind: "reel",
        tone: "violet",
        caption: "Top set incline press. Controlled eccentric, honest pause, no ego rep cameo.",
        tags: ["Maya"],
        likes: 410,
        saves: 68,
        reposts: 12,
        comments: [],
        slides: [
            {
                type: "photo",
                src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1100&q=80",
                alt: "Loaded barbell on a training rack",
                label: "Top set",
            },
        ],
    },
    {
        id: "seed-alex-meal",
        name: "Alex Rivera",
        handle: "alex.moves",
        action: "Shared meal prep",
        detail: "Protein handled for three days, future chaos reduced.",
        stat: "3,200 cal",
        tag: "Nutrition",
        kind: "post",
        tone: "orange",
        caption: "Meal prep stack. Future me has no courtroom defense for skipping protein now.",
        tags: ["Sam"],
        likes: 76,
        saves: 21,
        reposts: 3,
        comments: [],
        slides: [
            {
                type: "photo",
                src: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1100&q=80",
                alt: "Meal prep bowls with vegetables and protein",
                label: "Prep",
            },
        ],
    },
];

export const PUBLIC_PROFILE_REPOSTS = [
    {
        profileHandle: "maya.moves",
        repostedAt: "2026-06-25T16:02:00.000Z",
        postId: "seed-coach-pulldown",
    },
    {
        profileHandle: "runwithjo",
        repostedAt: "2026-06-25T11:15:00.000Z",
        postId: "seed-maya-cut",
    },
    {
        profileHandle: "sam.bulks",
        repostedAt: "2026-06-24T21:08:00.000Z",
        postId: "seed-coach-pulldown",
    },
    {
        profileHandle: "liftwithnia",
        repostedAt: "2026-06-25T19:18:00.000Z",
        postId: "seed-maya-cut",
    },
    {
        profileHandle: "brawn.coach",
        repostedAt: "2026-06-25T07:40:00.000Z",
        postId: "seed-sam-hinge",
    },
];

export const PUBLIC_PROFILE_STORIES = [
    {
        id: "story-maya-public",
        profileHandle: "maya.moves",
        detail: "Leg day PR",
        metric: "8h",
        tone: "pink",
        type: "photo",
        src: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=86",
        caption: "Last set moved better than the first. Tiny victories, loud quads.",
    },
    {
        id: "story-jordan-public",
        profileHandle: "runwithjo",
        detail: "Run route",
        metric: "1d",
        tone: "blue",
        type: "photo",
        src: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=900&q=86",
        caption: "Waterfront loop, six hard pushes, zero regrets.",
    },
    {
        id: "story-sam-public",
        profileHandle: "sam.bulks",
        detail: "Streak saved",
        metric: "1d",
        tone: "gold",
        type: "photo",
        src: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=86",
        caption: "The short session still counts. Streak court adjourned.",
    },
    {
        id: "story-coach-public",
        profileHandle: "brawn.coach",
        detail: "Form cue",
        metric: "New",
        tone: "green",
        type: "photo",
        src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=86",
        caption: "Today's cue: brace before the descent, then drive the floor away.",
    },
    {
        id: "story-nia-public",
        profileHandle: "liftwithnia",
        detail: "Push pump",
        metric: "6h",
        tone: "violet",
        type: "photo",
        src: "https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=900&q=86",
        caption: "Back-off sets: less drama, more signal.",
    },
    {
        id: "story-alex-public",
        profileHandle: "alex.moves",
        detail: "Meal prep",
        metric: "12h",
        tone: "orange",
        type: "photo",
        src: "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=900&q=86",
        caption: "Protein handled. Future me has no excuses now.",
    },
];

export const resolveSocialProfile = (value) => {
    const normalized = normalizeText(value);
    if (!normalized) return null;

    return (
        SOCIAL_PROFILES.find((profile) => {
            const handles = [profile.handle, profile.id, profile.name, ...(profile.aliases || [])].map(normalizeText);
            return handles.includes(normalized);
        }) || null
    );
};

export const getProfileRoute = (value, currentUser) => {
    const normalized = normalizeText(value);
    if (!normalized || normalized.startsWith("challenge.")) return null;

    const currentUserHandle = normalizeText(currentUser);
    if (currentUserHandle && [currentUserHandle, "you", "today"].includes(normalized)) {
        return "/profile";
    }

    if (["you", "today"].includes(normalized)) return "/profile";

    const profile = resolveSocialProfile(normalized);
    return `/profile/${encodeURIComponent(profile?.handle || normalized)}`;
};

export const profileMatchesValue = (profile, value) => {
    if (!profile || !value) return false;
    const normalized = normalizeText(value);
    const profileValues = [profile.handle, profile.id, profile.name, ...(profile.aliases || [])].map(normalizeText);
    return profileValues.includes(normalized);
};

export const makeFallbackProfile = (value) => {
    const normalized = normalizeText(value) || "athlete";
    const name = normalized
        .split(".")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

    return {
        id: normalized,
        name: name || "Athlete",
        handle: normalized,
        aliases: [name],
        initials: getInitials(name || normalized),
        verified: false,
        tone: "green",
        bio: "Training posts, tags, reposts, and stories will show here as this athlete shares more.",
        location: "Brawn",
        focus: "Training",
        followers: [],
        following: [],
    };
};
