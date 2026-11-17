import { createContext, useContext, useMemo, useState } from "react";

const SocialPostsContext = createContext(null);

const STORAGE_KEYS = {
    posts: "brawn-social-user-posts",
    saved: "brawn-social-saved-posts",
    liked: "brawn-social-liked-posts",
    comments: "brawn-social-comments",
    shares: "brawn-social-share-counts",
    reposted: "brawn-social-reposted-posts",
    stories: "brawn-social-user-stories",
    viewedStories: "brawn-social-viewed-stories",
    sentItems: "brawn-social-sent-items",
};

const readStoredValue = (key, fallback) => {
    if (typeof window === "undefined") return fallback;

    try {
        const storedValue = window.localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : fallback;
    } catch {
        return fallback;
    }
};

const writeStoredValue = (key, value) => {
    if (typeof window === "undefined") return;

    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
};

const seedPosts = [
    {
        id: "seed-maya-cut",
        name: "Maya",
        handle: "maya.moves",
        action: "Opened a cut challenge",
        detail: "30 lb goal, weekly weigh-ins, friend check-ins, and private DMs for accountability.",
        stat: "58 min",
        tag: "Compete",
        kind: "challenge",
        tone: "pink",
        caption: "Opened the cut challenge, then backed it up with a full lower-body session.",
        tags: ["Jordan", "Sam"],
        likes: 146,
        saves: 18,
        reposts: 4,
        comments: [
            {
                id: "seed-maya-comment-1",
                author: "Jordan",
                text: "That last squat set was outrageously clean.",
                createdAt: "2026-06-25T13:10:00.000Z",
            },
            {
                id: "seed-maya-comment-2",
                author: "Sam",
                text: "Challenge accepted. Friday check-in is on.",
                createdAt: "2026-06-25T13:18:00.000Z",
            },
        ],
        slides: [
            {
                type: "photo",
                src: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1100&q=80",
                alt: "Athlete resting beside gym equipment",
                label: "Check-in",
            },
            {
                type: "photo",
                src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1100&q=80",
                alt: "Athlete exercising with battle ropes",
                label: "Finisher",
            },
            {
                type: "workout",
                title: "Lower body strength",
                duration: "58 min",
                volume: "18,420 lb",
                exercises: [
                    { name: "Back squat", detail: "5 x 5 at 205 lb" },
                    { name: "Romanian deadlift", detail: "4 x 8 at 165 lb" },
                    { name: "Walking lunge", detail: "3 x 20 steps" },
                    { name: "Sled push", detail: "6 rounds" },
                ],
            },
        ],
    },
    {
        id: "seed-jordan-route",
        name: "Jordan",
        handle: "runwithjo",
        action: "Shared a route story",
        detail: "5.2 km waterfront loop with two sprint segments and a recovery walk home.",
        stat: "5.2 km",
        tag: "Story",
        kind: "route",
        tone: "blue",
        caption: "Route story with the workout details saved at the end.",
        tags: ["Maya"],
        likes: 89,
        saves: 11,
        reposts: 2,
        comments: [
            {
                id: "seed-jordan-comment-1",
                author: "Maya",
                text: "Saving this loop for Saturday.",
                createdAt: "2026-06-24T18:02:00.000Z",
            },
        ],
        slides: [
            {
                type: "photo",
                src: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1100&q=80",
                alt: "Runner on an outdoor path",
                label: "Route start",
            },
            {
                type: "photo",
                src: "https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=1100&q=80",
                alt: "Running shoes on pavement",
                label: "Splits",
            },
            {
                type: "workout",
                title: "Waterfront intervals",
                duration: "34 min",
                volume: "5.2 km",
                exercises: [
                    { name: "Warmup jog", detail: "8 min easy" },
                    { name: "Sprint segment", detail: "6 x 45 sec hard" },
                    { name: "Recovery walk", detail: "9 min cooldown" },
                ],
            },
        ],
    },
];

const fallbackPhotos = [
    {
        type: "photo",
        src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1100&q=80",
        alt: "Loaded barbell on a training rack",
        label: "Training photo",
    },
];

const fallbackWorkout = {
    title: "Workout complete",
    duration: "46 min",
    volume: "12,840 lb",
    exercises: [
        { name: "Bench press", detail: "4 x 6 at 185 lb" },
        { name: "Incline DB press", detail: "3 x 10 at 60 lb" },
        { name: "Cable fly", detail: "3 x 12 at 35 lb" },
    ],
};

const cleanHandle = (value) => (value || "you").toString().trim().toLowerCase().replace(/\s+/g, ".");

const getExpectedMediaType = (postType) => (postType === "reel" ? "video" : "photo");
const getMediaType = (photo) => (photo?.type === "video" ? "video" : "photo");

const getPostSlides = ({ photos, workout, includeWorkout, postType }) => {
    const expectedMediaType = getExpectedMediaType(postType);
    const mediaSlides = (photos || [])
        .filter((photo) => photo.src?.trim() && getMediaType(photo) === expectedMediaType)
        .map((photo, index) => ({
            type: getMediaType(photo),
            src: photo.src.trim(),
            alt: photo.alt?.trim() || `Post media ${index + 1}`,
            label: photo.label?.trim() || `${getMediaType(photo) === "video" ? "Clip" : "Photo"} ${index + 1}`,
            edits: photo.edits || null,
            style: photo.style || null,
        }));

    const slides = mediaSlides.length ? mediaSlides : postType === "reel" ? [] : [...fallbackPhotos];

    if (includeWorkout) {
        slides.push({
            type: "workout",
            ...(workout || fallbackWorkout),
            exercises: workout?.exercises?.length ? workout.exercises : fallbackWorkout.exercises,
        });
    }

    return slides;
};

export const SocialPostsProvider = ({ children }) => {
    const [userPosts, setUserPosts] = useState(() => readStoredValue(STORAGE_KEYS.posts, []));
    const [savedPostIds, setSavedPostIds] = useState(() => readStoredValue(STORAGE_KEYS.saved, []));
    const [likedPostIds, setLikedPostIds] = useState(() => readStoredValue(STORAGE_KEYS.liked, []));
    const [commentsByPost, setCommentsByPost] = useState(() => readStoredValue(STORAGE_KEYS.comments, {}));
    const [shareCounts, setShareCounts] = useState(() => readStoredValue(STORAGE_KEYS.shares, {}));
    const [repostedPostIds, setRepostedPostIds] = useState(() => readStoredValue(STORAGE_KEYS.reposted, []));
    const [userStories, setUserStories] = useState(() => readStoredValue(STORAGE_KEYS.stories, []));
    const [viewedStoryIds, setViewedStoryIds] = useState(() => readStoredValue(STORAGE_KEYS.viewedStories, []));
    const [sentItems, setSentItems] = useState(() => readStoredValue(STORAGE_KEYS.sentItems, []));
    const [composerDefaults, setComposerDefaults] = useState(null);
    const [isComposerOpen, setIsComposerOpen] = useState(false);

    const posts = useMemo(() => [...userPosts, ...seedPosts], [userPosts]);
    const activeStories = useMemo(() => {
        const expirationTime = Date.now() - 24 * 60 * 60 * 1000;
        return userStories.filter((story) => {
            const createdAt = new Date(story.createdAt).getTime();
            return Number.isNaN(createdAt) || createdAt >= expirationTime;
        });
    }, [userStories]);

    const openComposer = (defaults = {}) => {
        setComposerDefaults(defaults);
        setIsComposerOpen(true);
    };

    const closeComposer = () => {
        setIsComposerOpen(false);
        setComposerDefaults(null);
    };

    const createPost = (payload) => {
        const workout = payload.includeWorkout ? payload.workout || fallbackWorkout : null;
        const isReel = payload.postType === "reel";
        const expectedMediaType = getExpectedMediaType(payload.postType);
        const mediaCount = (payload.photos || []).filter((photo) => getMediaType(photo) === expectedMediaType && photo.src?.trim()).length;
        const post = {
            id: `post-${Date.now()}`,
            name: payload.authorName || "You",
            handle: cleanHandle(payload.handle || payload.authorName),
            action: workout ? `Completed ${workout.title}` : isReel ? "Shared a training reel" : "Shared a training post",
            detail: payload.description || payload.caption || "New post from today's training.",
            stat: workout?.duration || `${mediaCount || (isReel ? 0 : fallbackPhotos.length)} ${isReel ? "clips" : "photos"}`,
            tag: workout ? "Workout" : isReel ? "Reel" : "Post",
            kind: isReel ? "reel" : workout ? "workout" : "post",
            tone: "green",
            caption: payload.caption || "New training update.",
            description: payload.description || "",
            tags: payload.tags || [],
            location: payload.location || "",
            audience: payload.audience || "Friends",
            music: payload.music || null,
            clip: payload.clip || null,
            likes: 0,
            saves: 0,
            reposts: 0,
            comments: [],
            isOwn: true,
            createdAt: new Date().toISOString(),
            slides: getPostSlides(payload),
        };

        setUserPosts((currentPosts) => {
            const nextPosts = [post, ...currentPosts];
            writeStoredValue(STORAGE_KEYS.posts, nextPosts);
            return nextPosts;
        });

        return post;
    };

    const toggleSavePost = (postId) => {
        setSavedPostIds((currentIds) => {
            const nextIds = currentIds.includes(postId)
                ? currentIds.filter((id) => id !== postId)
                : [...currentIds, postId];
            writeStoredValue(STORAGE_KEYS.saved, nextIds);
            return nextIds;
        });
    };

    const toggleLikePost = (postId) => {
        setLikedPostIds((currentIds) => {
            const nextIds = currentIds.includes(postId)
                ? currentIds.filter((id) => id !== postId)
                : [...currentIds, postId];
            writeStoredValue(STORAGE_KEYS.liked, nextIds);
            return nextIds;
        });
    };

    const addComment = (postId, text, author = "You") => {
        const trimmedText = text.trim();
        if (!trimmedText) return null;

        const comment = {
            id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            author,
            text: trimmedText,
            createdAt: new Date().toISOString(),
            isOwn: true,
        };

        setCommentsByPost((currentComments) => {
            const nextComments = {
                ...currentComments,
                [postId]: [...(currentComments[postId] || []), comment],
            };
            writeStoredValue(STORAGE_KEYS.comments, nextComments);
            return nextComments;
        });

        return comment;
    };

    const removeComment = (postId, commentId) => {
        setCommentsByPost((currentComments) => {
            const nextComments = {
                ...currentComments,
                [postId]: (currentComments[postId] || []).filter((comment) => comment.id !== commentId),
            };
            writeStoredValue(STORAGE_KEYS.comments, nextComments);
            return nextComments;
        });
    };

    const incrementShareCount = (itemId) => {
        setShareCounts((currentCounts) => {
            const nextCounts = {
                ...currentCounts,
                [itemId]: (currentCounts[itemId] || 0) + 1,
            };
            writeStoredValue(STORAGE_KEYS.shares, nextCounts);
            return nextCounts;
        });
    };

    const toggleRepostPost = (post) => {
        const sourcePostId = post.repostSourceId || post.id;
        const isAlreadyReposted = repostedPostIds.includes(sourcePostId);

        if (isAlreadyReposted) {
            setUserPosts((currentPosts) => {
                const nextPosts = currentPosts.filter((candidate) => candidate.repostSourceId !== sourcePostId);
                writeStoredValue(STORAGE_KEYS.posts, nextPosts);
                return nextPosts;
            });
            setRepostedPostIds((currentIds) => {
                const nextIds = currentIds.filter((id) => id !== sourcePostId);
                writeStoredValue(STORAGE_KEYS.reposted, nextIds);
                return nextIds;
            });
            return false;
        }

        const repost = {
            ...post,
            id: `repost-${Date.now()}`,
            name: "You",
            handle: "you",
            isOwn: true,
            repostedFrom: post.name,
            repostSourceId: sourcePostId,
            reposts: 0,
            saves: 0,
            likes: 0,
            comments: [],
            createdAt: new Date().toISOString(),
        };

        setUserPosts((currentPosts) => {
            const nextPosts = [repost, ...currentPosts];
            writeStoredValue(STORAGE_KEYS.posts, nextPosts);
            return nextPosts;
        });
        setRepostedPostIds((currentIds) => {
            const nextIds = [...currentIds, sourcePostId];
            writeStoredValue(STORAGE_KEYS.reposted, nextIds);
            return nextIds;
        });
        return true;
    };

    const createStory = (payload) => {
        if (!payload.src?.trim()) return null;

        const story = {
            id: `story-${Date.now()}`,
            name: payload.name || "You",
            detail: payload.caption?.trim() || "Training check-in",
            caption: payload.caption?.trim() || "Training check-in",
            src: payload.src.trim(),
            type: payload.type === "video" ? "video" : "photo",
            tone: payload.tone || "green",
            createdAt: new Date().toISOString(),
            isOwn: true,
        };

        setUserStories((currentStories) => {
            const nextStories = [story, ...currentStories];
            writeStoredValue(STORAGE_KEYS.stories, nextStories);
            return nextStories;
        });

        return story;
    };

    const deleteStory = (storyId) => {
        setUserStories((currentStories) => {
            const nextStories = currentStories.filter((story) => story.id !== storyId);
            writeStoredValue(STORAGE_KEYS.stories, nextStories);
            return nextStories;
        });
    };

    const markStoryViewed = (storyId) => {
        setViewedStoryIds((currentIds) => {
            if (currentIds.includes(storyId)) return currentIds;
            const nextIds = [...currentIds, storyId];
            writeStoredValue(STORAGE_KEYS.viewedStories, nextIds);
            return nextIds;
        });
    };

    const sendSocialItem = (payload) => {
        const sentItem = {
            id: `sent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            threadId: payload.threadId,
            itemId: payload.itemId,
            itemType: payload.itemType || "post",
            title: payload.title || "Shared training update",
            preview: payload.preview || "",
            url: payload.url || "",
            createdAt: new Date().toISOString(),
        };

        setSentItems((currentItems) => {
            const nextItems = [...currentItems, sentItem];
            writeStoredValue(STORAGE_KEYS.sentItems, nextItems);
            return nextItems;
        });
        incrementShareCount(payload.itemId);
        return sentItem;
    };

    const value = {
        posts,
        userPosts,
        savedPostIds,
        likedPostIds,
        commentsByPost,
        shareCounts,
        repostedPostIds,
        userStories: activeStories,
        viewedStoryIds,
        sentItems,
        composerDefaults,
        isComposerOpen,
        openComposer,
        closeComposer,
        createPost,
        toggleSavePost,
        toggleLikePost,
        addComment,
        removeComment,
        toggleRepostPost,
        repostPost: toggleRepostPost,
        createStory,
        deleteStory,
        markStoryViewed,
        sendSocialItem,
        incrementShareCount,
    };

    return (
        <SocialPostsContext.Provider value={value}>
            {children}
        </SocialPostsContext.Provider>
    );
};

export const useSocialPosts = () => {
    const context = useContext(SocialPostsContext);
    if (!context) {
        throw new Error("useSocialPosts must be used within SocialPostsProvider");
    }

    return context;
};
