import {
    Activity,
    Bell,
    Bookmark,
    Bot,
    Camera,
    CalendarCheck,
    Check,
    ChevronLeft,
    ChevronRight,
    Clipboard,
    Compass,
    Dumbbell,
    Flame,
    Heart,
    ImagePlus,
    Link2,
    Map,
    MessageCircle,
    Moon,
    PlayCircle,
    Plus,
    RefreshCw,
    Repeat2,
    Route,
    Send,
    Sparkles,
    Sun,
    Trash2,
    Trophy,
    X,
} from "lucide-react";
import moment from "moment";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSocialPosts } from "../../context/SocialPostsContext";
import { getProfileRoute, normalizeProfileHandle } from "../../utils/socialProfiles";

const formatMinutes = (seconds = 0) => Math.max(0, Math.round(seconds / 60));

const getInitials = (name = "Athlete") =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

const isCurrentUserPostAuthor = ({ handle, isOwn, name }, currentUser) => {
    const normalizedHandle = normalizeProfileHandle(handle);
    const normalizedName = normalizeProfileHandle(name);
    const normalizedCurrentUser = normalizeProfileHandle(currentUser);

    return (
        isOwn ||
        normalizedName === "you" ||
        normalizedHandle === "you" ||
        (Boolean(normalizedCurrentUser) && normalizedHandle === normalizedCurrentUser)
    );
};

const formatMetricLabel = (count, singular, plural = `${singular}s`) =>
    `${count} ${count === 1 ? singular : plural}`;

const postIconByKind = {
    challenge: Trophy,
    post: Camera,
    reel: PlayCircle,
    route: Map,
    workout: Dumbbell,
};

const communityStories = [
    {
        id: "story-maya",
        name: "Maya",
        detail: "Leg day PR",
        metric: "8h",
        icon: Dumbbell,
        tone: "pink",
        type: "photo",
        src: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=86",
        caption: "Last set moved better than the first. Tiny victories, loud quads.",
    },
    {
        id: "story-alex",
        name: "Alex",
        detail: "Meal prep",
        metric: "12h",
        icon: Sparkles,
        tone: "gold",
        type: "photo",
        src: "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=900&q=86",
        caption: "Protein handled. Future me has no excuses now.",
    },
    {
        id: "story-jordan",
        name: "Jordan",
        detail: "Run route",
        metric: "1d",
        icon: Route,
        tone: "blue",
        type: "photo",
        src: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=900&q=86",
        caption: "Waterfront loop, six hard pushes, zero regrets.",
    },
    {
        id: "story-sam",
        name: "Sam",
        detail: "Streak saved",
        metric: "1d",
        icon: Flame,
        tone: "orange",
        type: "photo",
        src: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=86",
        caption: "The short session still counts. Streak court adjourned.",
    },
    {
        id: "story-coach",
        name: "Coach AI",
        detail: "Form cue",
        metric: "New",
        icon: Bot,
        tone: "violet",
        type: "photo",
        src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=86",
        caption: "Today’s cue: brace before the descent, then drive the floor away.",
    },
];

const notificationSeed = [
    {
        id: "notification-like",
        title: "Maya liked your training check-in",
        detail: "A few seconds ago",
        tone: "pink",
        postId: "you-starter",
    },
    {
        id: "notification-comment",
        title: "Jordan commented on your workout",
        detail: "“That final set looked strong.”",
        tone: "blue",
        postId: "you-starter",
    },
    {
        id: "notification-challenge",
        title: "Sam invited you to a streak challenge",
        detail: "10 days, no dramatic loopholes.",
        tone: "gold",
    },
];

const readMediaFile = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
            resolve({
                src: reader.result,
                type: file.type.startsWith("video/") ? "video" : "photo",
            });
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const Dashboard = ({
    CurrentWorkoutStreak,
    WeeklyWorkouts,
    TotalWorkouts,
    user,
    routines,
}) => {
    const [homeTheme, setHomeTheme] = useState(() => {
        if (typeof window === "undefined") return "light";
        const savedTheme = window.localStorage.getItem("brawn-home-theme");
        if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
        return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });
    const [postSlides, setPostSlides] = useState({});
    const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
    const [commentDrafts, setCommentDrafts] = useState({});
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [readNotificationIds, setReadNotificationIds] = useState(() => {
        if (typeof window === "undefined") return [];
        try {
            return JSON.parse(window.localStorage.getItem("brawn-social-read-notifications") || "[]");
        } catch {
            return [];
        }
    });
    const [activeStoryId, setActiveStoryId] = useState(() => {
        if (typeof window === "undefined") return null;
        return new URLSearchParams(window.location.search).get("story");
    });
    const [isStoryComposerOpen, setIsStoryComposerOpen] = useState(false);
    const [storyDraft, setStoryDraft] = useState({ src: "", type: "photo", caption: "" });
    const [storyUrl, setStoryUrl] = useState("");
    const [shareTarget, setShareTarget] = useState(null);
    const [sentThreadIds, setSentThreadIds] = useState([]);
    const [toast, setToast] = useState("");
    const storyFileInputRef = useRef(null);
    const {
        posts: socialPosts,
        savedPostIds,
        likedPostIds,
        commentsByPost,
        shareCounts,
        repostedPostIds,
        userStories,
        viewedStoryIds,
        toggleSavePost,
        toggleLikePost,
        addComment,
        removeComment,
        toggleRepostPost,
        createStory,
        deleteStory,
        markStoryViewed,
        sendSocialItem,
        incrementShareCount,
    } = useSocialPosts();

    useEffect(() => {
        window.localStorage.setItem("brawn-home-theme", homeTheme);
        window.dispatchEvent(new Event("brawn-theme-change"));
    }, [homeTheme]);

    useEffect(() => {
        if (!toast) return undefined;
        const timeoutId = window.setTimeout(() => setToast(""), 2600);
        return () => window.clearTimeout(timeoutId);
    }, [toast]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key !== "Escape") return;
            setIsNotificationsOpen(false);
            setActiveStoryId(null);
            setIsStoryComposerOpen(false);
            setShareTarget(null);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const capitalizedName = user ? user.charAt(0).toUpperCase() + user.slice(1) : "Athlete";
    const routineList = routines || [];
    const safeWeeklyWorkouts = useMemo(() => WeeklyWorkouts || [], [WeeklyWorkouts]);
    const weeklyEntries = useMemo(
        () =>
            safeWeeklyWorkouts
                .flatMap(
                    (routine) =>
                        routine.completionStats?.map((stat) => ({
                            routine: routine.name,
                            totalTime: stat.totalTime || 0,
                            date: stat.date,
                        })) || []
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date)),
        [safeWeeklyWorkouts]
    );

    const weeklyMinutes = formatMinutes(
        weeklyEntries.reduce((total, workout) => total + workout.totalTime, 0)
    );
    const primaryRoutine = routineList[0];
    const currentStreak = CurrentWorkoutStreak || 0;

    const stories = useMemo(
        () => [
            ...userStories.map((story) => ({
                ...story,
                name: capitalizedName,
                detail: story.caption || "Training check-in",
                metric: "Now",
                icon: Camera,
                tone: story.tone || "green",
            })),
            ...communityStories,
        ],
        [capitalizedName, userStories]
    );

    const dmThreads = [
        {
            id: "maya",
            name: "Maya",
            preview: "Want to join the 30 lb cut squad?",
            time: "2m",
            unread: 2,
            tone: "pink",
        },
        {
            id: "coach",
            name: "Coach AI",
            preview: "Your next lift could use more rest.",
            time: "18m",
            unread: 0,
            tone: "green",
        },
        {
            id: "jordan",
            name: "Jordan",
            preview: "Race to 10 streak days?",
            time: "1h",
            unread: 1,
            tone: "blue",
        },
    ];

    const recentWorkouts = weeklyEntries.length
        ? weeklyEntries.slice(0, 3)
        : [
              {
                  routine: "No workouts logged yet",
                  totalTime: 0,
                  date: null,
              },
          ];

    const feedItems = useMemo(() => {
        const hasOwnPosts = socialPosts.some((post) => post.isOwn);
        const starterPost = {
            id: "you-starter",
            name: capitalizedName,
            handle: user || "you",
            action: weeklyEntries[0] ? `Finished ${weeklyEntries[0].routine}` : "Ready for today's session",
            detail: weeklyEntries[0]
                ? `${formatMinutes(weeklyEntries[0].totalTime)} minutes logged and your streak is still alive.`
                : "Use Create in the navbar to build your first carousel post.",
            stat: weeklyEntries[0] ? `${formatMinutes(weeklyEntries[0].totalTime)} min` : "Create",
            tag: weeklyEntries[0] ? "Workout" : "Plan",
            kind: "workout",
            tone: "green",
            caption: weeklyEntries[0]
                ? "Logged it, saved it, and keeping the streak warm."
                : "Planning the first check-in. Photos first, workout receipt last.",
            tags: [],
            likes: weeklyEntries[0] ? 12 : 0,
            saves: 0,
            reposts: 0,
            comments: [],
            slides: [
                {
                    type: "photo",
                    src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1100&q=80",
                    alt: "Loaded barbell on a training rack",
                    label: "Warmup set",
                },
                {
                    type: "workout",
                    title: weeklyEntries[0]?.routine || "Upper Hypertrophy A",
                    duration: weeklyEntries[0] ? `${formatMinutes(weeklyEntries[0].totalTime)} min` : "46 min",
                    volume: "12,840 lb",
                    exercises: [
                        { name: "Bench press", detail: "4 x 6 at 185 lb" },
                        { name: "Incline DB press", detail: "3 x 10 at 60 lb" },
                        { name: "Cable fly", detail: "3 x 12 at 35 lb" },
                    ],
                },
            ],
        };

        return [
            ...(hasOwnPosts ? [] : [starterPost]),
            ...socialPosts,
        ].map((post) => ({
            ...post,
            icon: postIconByKind[post.kind] || Dumbbell,
        }));
    }, [capitalizedName, socialPosts, user, weeklyEntries]);

    const todayStats = [
        { label: "Streak", value: `${currentStreak}d`, icon: Flame, tone: "orange" },
        { label: "Week", value: `${weeklyEntries.length}`, icon: CalendarCheck, tone: "green" },
        { label: "Minutes", value: `${weeklyMinutes}`, icon: Activity, tone: "blue" },
        { label: "Total", value: `${TotalWorkouts || 0}`, icon: Trophy, tone: "gold" },
    ];

    const suggestedCreators = [
        { name: "Maya", detail: "Lower body strength", tone: "pink" },
        { name: "Coach AI", detail: "Form cues", tone: "green" },
        { name: "Jordan", detail: "Running routes", tone: "blue" },
    ];

    const movePostSlide = (postId, slideCount, direction) => {
        setPostSlides((currentSlides) => {
            const currentIndex = currentSlides[postId] || 0;
            const nextIndex = (currentIndex + direction + slideCount) % slideCount;
            return {
                ...currentSlides,
                [postId]: nextIndex,
            };
        });
    };

    const selectPostSlide = (postId, slideIndex) => {
        setPostSlides((currentSlides) => ({
            ...currentSlides,
            [postId]: slideIndex,
        }));
    };

    const showToast = (message) => {
        setToast("");
        window.requestAnimationFrame(() => setToast(message));
    };

    const refreshFeed = () => {
        setPostSlides({});
        setIsNotificationsOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        showToast("Feed refreshed");
    };

    const markNotificationRead = (notification) => {
        setReadNotificationIds((currentIds) => {
            if (currentIds.includes(notification.id)) return currentIds;
            const nextIds = [...currentIds, notification.id];
            window.localStorage.setItem("brawn-social-read-notifications", JSON.stringify(nextIds));
            return nextIds;
        });
        setIsNotificationsOpen(false);

        if (notification.postId) {
            window.setTimeout(() => {
                document.getElementById(`social-post-${notification.postId}`)?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 0);
        } else {
            showToast("Challenge invite saved to notifications");
        }
    };

    const markAllNotificationsRead = () => {
        const nextIds = notificationSeed.map((notification) => notification.id);
        setReadNotificationIds(nextIds);
        window.localStorage.setItem("brawn-social-read-notifications", JSON.stringify(nextIds));
    };

    const openStory = (storyId) => {
        markStoryViewed(storyId);
        setActiveStoryId(storyId);
    };

    const moveStory = (direction) => {
        if (!stories.length) return;
        const currentIndex = Math.max(0, stories.findIndex((story) => story.id === activeStoryId));
        const nextIndex = (currentIndex + direction + stories.length) % stories.length;
        const nextStory = stories[nextIndex];
        markStoryViewed(nextStory.id);
        setActiveStoryId(nextStory.id);
    };

    const resetStoryComposer = () => {
        setStoryDraft({ src: "", type: "photo", caption: "" });
        setStoryUrl("");
        setIsStoryComposerOpen(false);
    };

    const handleStoryFiles = async (fileList) => {
        const file = Array.from(fileList || []).find(
            (candidate) => candidate.type.startsWith("image/") || candidate.type.startsWith("video/")
        );
        if (!file) {
            showToast("Choose an image or video for your story");
            return;
        }

        try {
            const media = await readMediaFile(file);
            setStoryDraft((currentDraft) => ({ ...currentDraft, ...media }));
            setStoryUrl("");
        } catch {
            showToast("That media could not be loaded");
        }
    };

    const addStoryUrl = () => {
        const src = storyUrl.trim();
        if (!src) return;
        const type = /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src) ? "video" : "photo";
        setStoryDraft((currentDraft) => ({ ...currentDraft, src, type }));
    };

    const publishStory = () => {
        const story = createStory({
            ...storyDraft,
            name: capitalizedName,
        });
        if (!story) return;
        resetStoryComposer();
        showToast("Story shared");
        window.setTimeout(() => openStory(story.id), 0);
    };

    const openSharePanel = (itemType, item) => {
        setSentThreadIds([]);
        setShareTarget({ itemType, item });
    };

    const getShareUrl = (itemType, itemId) =>
        itemType === "story"
            ? `${window.location.origin}/dashboard?story=${encodeURIComponent(itemId)}`
            : `${window.location.origin}/dashboard#social-post-${itemId}`;

    const sendItemToThread = (thread) => {
        if (!shareTarget || sentThreadIds.includes(thread.id)) return;
        const { itemType, item } = shareTarget;
        sendSocialItem({
            threadId: thread.id,
            itemId: item.id,
            itemType,
            title: itemType === "story" ? `${item.name}'s story` : `${item.name}'s post`,
            preview: item.caption || item.detail || item.action,
            url: getShareUrl(itemType, item.id),
        });
        setSentThreadIds((currentIds) => [...currentIds, thread.id]);
        showToast(`Sent to ${thread.name}`);
    };

    const copyShareLink = async () => {
        if (!shareTarget) return;
        const shareUrl = getShareUrl(shareTarget.itemType, shareTarget.item.id);
        try {
            await navigator.clipboard.writeText(shareUrl);
        } catch {
            const temporaryInput = document.createElement("textarea");
            temporaryInput.value = shareUrl;
            document.body.appendChild(temporaryInput);
            temporaryInput.select();
            document.execCommand("copy");
            temporaryInput.remove();
        }
        incrementShareCount(shareTarget.item.id);
        showToast("Link copied");
    };

    const shareWithDevice = async () => {
        if (!shareTarget || !navigator.share) return;
        const { itemType, item } = shareTarget;
        try {
            await navigator.share({
                title: itemType === "story" ? `${item.name}'s story` : `${item.name}'s post`,
                text: item.caption || item.detail || "Training update on Brawn",
                url: getShareUrl(itemType, item.id),
            });
            incrementShareCount(item.id);
            showToast("Shared");
        } catch (error) {
            if (error?.name !== "AbortError") showToast("Share was not completed");
        }
    };

    const submitComment = (event, postId) => {
        event.preventDefault();
        const draft = commentDrafts[postId] || "";
        const comment = addComment(postId, draft, capitalizedName);
        if (!comment) return;
        setCommentDrafts((currentDrafts) => ({ ...currentDrafts, [postId]: "" }));
        showToast("Comment posted");
    };

    const activeStory = stories.find((story) => story.id === activeStoryId) || null;
    const activeStoryProfileRoute = activeStory
        ? getProfileRoute(activeStory.profileHandle || activeStory.handle || activeStory.name, user)
        : null;
    const unreadNotificationCount = notificationSeed.filter(
        (notification) => !readNotificationIds.includes(notification.id)
    ).length;

    return (
        <div className={`social-home social-home-${homeTheme}`}>
            <header className="social-homebar">
                <nav className="social-home-tabs" aria-label="Home feed">
                    <button type="button" className="active" onClick={refreshFeed} title="Refresh feed">
                        <RefreshCw className="h-4 w-4" />
                        For you
                    </button>
                    <Link to="/discover">
                        <Compass className="h-4 w-4" />
                        Discover
                    </Link>
                </nav>

                <div className="social-homebar-actions">
                    <button
                        type="button"
                        className={`social-icon-button social-notification-button ${isNotificationsOpen ? "active" : ""}`}
                        onClick={() => setIsNotificationsOpen((isOpen) => !isOpen)}
                        aria-label="Notifications"
                        title="Notifications"
                        aria-expanded={isNotificationsOpen}
                    >
                        <Bell className="h-5 w-5" />
                        {unreadNotificationCount > 0 && <span>{unreadNotificationCount}</span>}
                    </button>
                    <button
                        type="button"
                        className="social-icon-button"
                        onClick={() => setHomeTheme((current) => (current === "dark" ? "light" : "dark"))}
                        aria-label={`Switch to ${homeTheme === "dark" ? "light" : "dark"} mode`}
                        title={`Switch to ${homeTheme === "dark" ? "light" : "dark"} mode`}
                    >
                        {homeTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <Link
                        to={primaryRoutine ? `/routines/${primaryRoutine._id}` : "/routines"}
                        className="social-start-button"
                        aria-label="Start workout"
                        title="Start workout"
                    >
                        <PlayCircle className="h-5 w-5" />
                    </Link>
                </div>

                {isNotificationsOpen && (
                    <section className="social-notification-popover" aria-label="Notifications">
                        <header>
                            <div>
                                <p className="social-kicker">Activity</p>
                                <h2>Notifications</h2>
                            </div>
                            <button type="button" onClick={markAllNotificationsRead} disabled={!unreadNotificationCount}>
                                Mark all read
                            </button>
                        </header>
                        <div>
                            {notificationSeed.map((notification) => {
                                const isRead = readNotificationIds.includes(notification.id);
                                return (
                                    <button
                                        type="button"
                                        key={notification.id}
                                        className={isRead ? "read" : ""}
                                        onClick={() => markNotificationRead(notification)}
                                    >
                                        <span className={`social-avatar tone-${notification.tone}`}>
                                            {notification.title.charAt(0)}
                                        </span>
                                        <span>
                                            <strong>{notification.title}</strong>
                                            <small>{notification.detail}</small>
                                        </span>
                                        {!isRead && <i aria-label="Unread" />}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}
            </header>

            <div className="social-feed-shell">
                <main className="social-feed-column">
                    <section className="social-story-rail" aria-label="Stories">
                        <button
                            type="button"
                            className="social-story-create"
                            onClick={() => setIsStoryComposerOpen(true)}
                            aria-label="Create story"
                            title="Create story"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                        {stories.map(({ id, name, detail, metric, icon: Icon, tone }) => {
                            const isViewed = viewedStoryIds.includes(id);
                            return (
                                <button
                                    type="button"
                                    className={`social-story ${isViewed ? "viewed" : ""}`}
                                    key={id}
                                    onClick={() => openStory(id)}
                                    aria-label={`View ${name}'s story: ${detail}`}
                                >
                                    <span className={`social-story-ring tone-${tone} ${isViewed ? "" : "active"}`}>
                                        <span>
                                            <Icon className="h-5 w-5" />
                                        </span>
                                    </span>
                                    <strong>{name}</strong>
                                    <small>{metric}</small>
                                    <em>{detail}</em>
                                </button>
                            );
                        })}
                    </section>

                    <section className="social-feed-list" aria-label="Feed">
                        {feedItems.map((post) => {
                            const {
                                id,
                                name,
                                handle,
                                action,
                                detail,
                                stat,
                                tag,
                                icon: Icon,
                                tone,
                                caption,
                                slides,
                                tags,
                                repostedFrom,
                                saves,
                                reposts,
                                likes,
                                comments: seedComments = [],
                                description,
                                location,
                                createdAt,
                                isOwn,
                            } = post;
                            const activeSlideIndex = postSlides[id] || 0;
                            const activeSlide = slides[activeSlideIndex] || slides[0];
                            const isWorkoutSlide = activeSlide.type === "workout";
                            const isSaved = savedPostIds.includes(id);
                            const isLiked = likedPostIds.includes(id);
                            const repostSourceId = post.repostSourceId || id;
                            const isReposted = repostedPostIds.includes(repostSourceId);
                            const postComments = [...seedComments, ...(commentsByPost[id] || [])];
                            const likeCount = (likes || 0) + (isLiked ? 1 : 0);
                            const saveCount = (saves || 0) + (isSaved ? 1 : 0);
                            const repostCount = (reposts || 0) + (isReposted ? 1 : 0);
                            const shareCount = shareCounts[id] || 0;
                            const isCommentsOpen = activeCommentsPostId === id;
                            const supportingDescription =
                                description?.trim() ||
                                (detail?.trim() && detail.trim() !== caption?.trim() ? detail.trim() : "");
                            const authorProfileRoute = getProfileRoute(handle || name, user);
                            const shouldShowAuthorHandle = Boolean(
                                handle &&
                                !isCurrentUserPostAuthor({ handle, isOwn, name }, user)
                            );

                            return (
                                <article key={id} id={`social-post-${id}`} className="social-post">
                                    <header className="social-post-header">
                                        {authorProfileRoute ? (
                                            <Link to={authorProfileRoute} className="social-post-author-link">
                                                <span className={`social-avatar tone-${tone}`}>{getInitials(name)}</span>
                                                <span>
                                                    <span className="social-post-author-name">{name}</span>
                                                    {shouldShowAuthorHandle && (
                                                        <span className="social-post-author-handle">@{handle}</span>
                                                    )}
                                                </span>
                                            </Link>
                                        ) : (
                                            <>
                                                <div className={`social-avatar tone-${tone}`}>{getInitials(name)}</div>
                                                <div>
                                                    <h2>{name}</h2>
                                                    {shouldShowAuthorHandle && <p>@{handle}</p>}
                                                </div>
                                            </>
                                        )}
                                        <span className={`social-chip tone-${tone}`}>{tag}</span>
                                    </header>

                                    <div
                                        className={`social-post-carousel tone-${tone}`}
                                        onDoubleClick={() => {
                                            if (!isLiked) {
                                                toggleLikePost(id);
                                                showToast(`Liked ${name}'s post`);
                                            }
                                        }}
                                    >
                                        <div className="social-post-slide-count">
                                            {activeSlideIndex + 1}/{slides.length}
                                        </div>
                                        {slides.length > 1 && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="social-carousel-control previous"
                                                    onClick={() => movePostSlide(id, slides.length, -1)}
                                                    aria-label={`Previous slide in ${name}'s post`}
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="social-carousel-control next"
                                                    onClick={() => movePostSlide(id, slides.length, 1)}
                                                    aria-label={`Next slide in ${name}'s post`}
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}

                                        {isWorkoutSlide ? (
                                            <div className="social-workout-slide">
                                                <div className="social-workout-slide-header">
                                                    <span className={`social-tile-icon tone-${tone}`}>
                                                        <Icon className="h-5 w-5" />
                                                    </span>
                                                    <div>
                                                        <p>Workout complete</p>
                                                        <h3>{activeSlide.title}</h3>
                                                    </div>
                                                    <strong>{activeSlide.duration}</strong>
                                                </div>
                                                <div className="social-workout-summary-grid">
                                                    <div>
                                                        <span>Total</span>
                                                        <strong>{activeSlide.volume}</strong>
                                                    </div>
                                                    <div>
                                                        <span>Result</span>
                                                        <strong>{stat}</strong>
                                                    </div>
                                                </div>
                                                <div className="social-workout-exercises">
                                                    {activeSlide.exercises.map((exercise) => (
                                                        <div key={`${id}-${exercise.name}`}>
                                                            <span>{exercise.name}</span>
                                                            <strong>{exercise.detail}</strong>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : activeSlide.type === "video" ? (
                                            <figure className="social-photo-slide">
                                                <video src={activeSlide.src} controls muted playsInline />
                                                <figcaption>{activeSlide.label}</figcaption>
                                            </figure>
                                        ) : (
                                            <figure className="social-photo-slide">
                                                <img src={activeSlide.src} alt={activeSlide.alt} style={activeSlide.style || undefined} />
                                                <figcaption>{activeSlide.label}</figcaption>
                                            </figure>
                                        )}
                                    </div>

                                    <div className="social-carousel-dots" aria-label={`${name}'s post slides`}>
                                        {slides.map((slide, index) => (
                                            <button
                                                key={`${id}-${slide.type}-${index}`}
                                                type="button"
                                                className={index === activeSlideIndex ? "active" : ""}
                                                onClick={() => selectPostSlide(id, index)}
                                                aria-label={`Show slide ${index + 1} of ${slides.length}`}
                                            />
                                        ))}
                                    </div>

                                    <div className="social-post-caption">
                                        {repostedFrom && (
                                            <div className="social-repost-note">
                                                <Repeat2 className="h-3.5 w-3.5" />
                                                Reposted from{" "}
                                                {getProfileRoute(repostedFrom, user) ? (
                                                    <Link to={getProfileRoute(repostedFrom, user)}>{repostedFrom}</Link>
                                                ) : (
                                                    repostedFrom
                                                )}
                                            </div>
                                        )}
                                        <div className="social-post-caption-heading">
                                            {authorProfileRoute ? (
                                                <Link to={authorProfileRoute} className="social-post-caption-author">
                                                    <strong>{name}</strong>
                                                </Link>
                                            ) : (
                                                <>
                                                    <strong>{name}</strong>
                                                </>
                                            )}
                                        </div>
                                        <p className="social-post-caption-copy">{caption}</p>
                                        {!!tags?.length && (
                                            <div className="social-post-tags">
                                                {tags.map((person) => {
                                                    const tagRoute = getProfileRoute(person, user);

                                                    return tagRoute ? (
                                                        <Link key={`${id}-${person}`} to={tagRoute} className="social-post-tag-link">
                                                            @{person}
                                                        </Link>
                                                    ) : (
                                                        <span key={`${id}-${person}`}>@{person}</span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {supportingDescription && (
                                            <p className="social-post-description">{supportingDescription}</p>
                                        )}
                                        <div className="social-post-caption-meta">
                                            <span>{action}</span>
                                            {location && <span>{location}</span>}
                                            <time dateTime={createdAt || undefined}>
                                                {createdAt ? moment(createdAt).fromNow() : "Today"}
                                            </time>
                                        </div>
                                    </div>

                                    <footer className="social-post-actions">
                                        <button
                                            type="button"
                                            className={isLiked ? "is-liked" : ""}
                                            onClick={() => {
                                                toggleLikePost(id);
                                                showToast(isLiked ? "Like removed" : `Liked ${name}'s post`);
                                            }}
                                            aria-label={`${isLiked ? "Unlike" : "Like"} ${name}'s post, ${formatMetricLabel(likeCount, "like")}`}
                                            aria-pressed={isLiked}
                                        >
                                            <Heart className={`h-4 w-4 ${isLiked ? "liked" : ""}`} />
                                            <span className="social-post-action-label">{isLiked ? "Liked" : "Like"}</span>
                                            <span className="social-post-action-count">{likeCount}</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={isSaved ? "is-saved" : ""}
                                            onClick={() => {
                                                toggleSavePost(id);
                                                showToast(isSaved ? "Removed from saved posts" : "Post saved");
                                            }}
                                            aria-label={`${isSaved ? "Unsave" : "Save"} ${name}'s post, ${formatMetricLabel(saveCount, "save")}`}
                                            aria-pressed={isSaved}
                                        >
                                            <Bookmark className={`h-4 w-4 ${isSaved ? "saved" : ""}`} />
                                            <span className="social-post-action-label">{isSaved ? "Saved" : "Save"}</span>
                                            <span className="social-post-action-count">{saveCount}</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={isReposted ? "is-reposted" : ""}
                                            onClick={() => {
                                                toggleRepostPost(post);
                                                showToast(isReposted ? "Repost removed" : "Reposted to your feed");
                                            }}
                                            aria-label={`${isReposted ? "Remove repost of" : "Repost"} ${name}'s post, ${formatMetricLabel(repostCount, "repost")}`}
                                            aria-pressed={isReposted}
                                        >
                                            <Repeat2 className="h-4 w-4" />
                                            <span className="social-post-action-label">{isReposted ? "Reposted" : "Repost"}</span>
                                            <span className="social-post-action-count">{repostCount}</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={isCommentsOpen ? "active" : ""}
                                            onClick={() => setActiveCommentsPostId(isCommentsOpen ? null : id)}
                                            aria-label={`Comment on ${name}'s post, ${formatMetricLabel(postComments.length, "comment")}`}
                                            aria-expanded={isCommentsOpen}
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                            <span className="social-post-action-label">Comment</span>
                                            <span className="social-post-action-count">{postComments.length}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openSharePanel("post", post)}
                                            aria-label={`Send ${name}'s post, ${formatMetricLabel(shareCount, "send")}`}
                                        >
                                            <Send className="h-4 w-4" />
                                            <span className="social-post-action-label">Send</span>
                                            <span className="social-post-action-count">{shareCount}</span>
                                        </button>
                                    </footer>

                                    {isCommentsOpen && (
                                        <section className="social-comments-panel" aria-label={`Comments on ${name}'s post`}>
                                            <header className="social-comments-heading">
                                                <div>
                                                    <strong>Comments</strong>
                                                    <span>
                                                        {postComments.length
                                                            ? `${postComments.length} ${postComments.length === 1 ? "response" : "responses"}`
                                                            : "Start the conversation"}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveCommentsPostId(null)}
                                                    aria-label="Close comments"
                                                    title="Close comments"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </header>
                                            <div className="social-comment-list">
                                                {postComments.length ? (
                                                    postComments.map((comment) => (
                                                        <article key={comment.id} className="social-comment">
                                                            <span className={`social-avatar tone-${comment.isOwn ? "green" : tone}`}>
                                                                {getInitials(comment.author)}
                                                            </span>
                                                            <div className="social-comment-content">
                                                                <div className="social-comment-meta">
                                                                    {getProfileRoute(comment.author, user) ? (
                                                                        <Link to={getProfileRoute(comment.author, user)} className="social-comment-author-link">
                                                                            {comment.author}
                                                                        </Link>
                                                                    ) : (
                                                                        <strong>{comment.author}</strong>
                                                                    )}
                                                                    <time dateTime={comment.createdAt}>
                                                                        {moment(comment.createdAt).fromNow()}
                                                                    </time>
                                                                    {comment.isOwn && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeComment(id, comment.id)}
                                                                            aria-label="Delete comment"
                                                                            title="Delete comment"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <p>{comment.text}</p>
                                                            </div>
                                                        </article>
                                                    ))
                                                ) : (
                                                    <div className="social-comments-empty">
                                                        <MessageCircle className="h-5 w-5" />
                                                        <strong>No comments yet</strong>
                                                        <span>Be the first to leave some encouragement.</span>
                                                    </div>
                                                )}
                                            </div>
                                            <form onSubmit={(event) => submitComment(event, id)} className="social-comment-form">
                                                <span className="social-avatar tone-green">{getInitials(capitalizedName)}</span>
                                                <textarea
                                                    value={commentDrafts[id] || ""}
                                                    onChange={(event) =>
                                                        setCommentDrafts((currentDrafts) => ({
                                                            ...currentDrafts,
                                                            [id]: event.target.value,
                                                        }))
                                                    }
                                                    rows={1}
                                                    maxLength={400}
                                                    placeholder={`Comment as ${capitalizedName}`}
                                                    aria-label={`Comment on ${name}'s post`}
                                                    onKeyDown={(event) => {
                                                        if (event.key === "Enter" && !event.shiftKey) {
                                                            event.preventDefault();
                                                            submitComment(event, id);
                                                        }
                                                    }}
                                                />
                                                <button type="submit" disabled={!commentDrafts[id]?.trim()} aria-label="Post comment">
                                                    <Send className="h-4 w-4" />
                                                </button>
                                            </form>
                                        </section>
                                    )}
                                </article>
                            );
                        })}
                    </section>
                </main>

                <aside className="social-context-rail" aria-label="Training context">
                    <section className="social-now-card">
                        <div className="social-now-header">
                            <div>
                                <p className="social-kicker">Today</p>
                                <h2>{primaryRoutine?.name || "Pick a plan"}</h2>
                            </div>
                            <span className="social-avatar tone-green">{getInitials(capitalizedName)}</span>
                        </div>
                        <div className="social-now-stats">
                            {todayStats.map(({ label, value, icon: Icon, tone }) => (
                                <div key={label}>
                                    <Icon className={`h-4 w-4 tone-${tone}`} />
                                    <strong>{value}</strong>
                                    <span>{label}</span>
                                </div>
                            ))}
                        </div>
                        <Link to={primaryRoutine ? `/routines/${primaryRoutine._id}` : "/routines"} className="social-now-start">
                            <PlayCircle className="h-4 w-4" />
                            {primaryRoutine ? "Start workout" : "Build routine"}
                        </Link>
                    </section>

                    <section className="social-rail-panel">
                        <div className="social-section-heading compact">
                            <div>
                                <p className="social-kicker">Recent</p>
                                <h2>Training receipts</h2>
                            </div>
                        </div>
                        <div className="social-recent-list">
                            {recentWorkouts.map((workout, index) => (
                                <div key={`${workout.routine}-${index}`}>
                                    <Dumbbell className="h-4 w-4" />
                                    <div>
                                        <strong>{workout.routine}</strong>
                                        <span>
                                            {workout.date
                                                ? `${formatMinutes(workout.totalTime)} min | ${moment(workout.date).format("MMM D")}`
                                                : "Log one and make the feed jealous."}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="social-rail-panel">
                        <div className="social-section-heading compact">
                            <div>
                                <p className="social-kicker">People</p>
                                <h2>Train with</h2>
                            </div>
                        </div>
                        <div className="social-creator-list">
                            {suggestedCreators.map(({ name, detail, tone }) => (
                                <Link to={getProfileRoute(name, user) || "/discover"} key={name}>
                                    <span className={`social-avatar tone-${tone}`}>{getInitials(name)}</span>
                                    <div>
                                        <strong>{name}</strong>
                                        <small>{detail}</small>
                                    </div>
                                    <Sparkles className="h-4 w-4" />
                                </Link>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>

            <Link to="/messages" className="social-floating-dm" aria-label="Open messages">
                <span className="social-floating-dm-avatars">
                    {dmThreads.slice(0, 3).map((thread) => (
                        <span key={thread.id} className={`social-avatar tone-${thread.tone}`}>{getInitials(thread.name)}</span>
                    ))}
                </span>
                <span className="social-floating-dm-copy">
                    <strong>Messages</strong>
                    <small>{dmThreads[0].preview}</small>
                </span>
                <span className="social-floating-dm-count">3</span>
            </Link>

            {isStoryComposerOpen && (
                <div className="social-dialog-backdrop" role="presentation" onMouseDown={resetStoryComposer}>
                    <section
                        className="social-dialog social-story-composer"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="story-composer-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <header className="social-dialog-header">
                            <div>
                                <p className="social-kicker">24 hour check-in</p>
                                <h2 id="story-composer-title">Create story</h2>
                            </div>
                            <button type="button" onClick={resetStoryComposer} aria-label="Close story creator">
                                <X className="h-5 w-5" />
                            </button>
                        </header>

                        <div className={`social-story-draft-preview ${storyDraft.src ? "has-media" : ""}`}>
                            {storyDraft.src ? (
                                storyDraft.type === "video" ? (
                                    <video src={storyDraft.src} controls muted playsInline />
                                ) : (
                                    <img src={storyDraft.src} alt="Story preview" />
                                )
                            ) : (
                                <button type="button" onClick={() => storyFileInputRef.current?.click()}>
                                    <ImagePlus className="h-8 w-8" />
                                    <strong>Add a photo or video</strong>
                                    <span>Share a lift, route, meal, or quick check-in.</span>
                                </button>
                            )}
                        </div>

                        <input
                            ref={storyFileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            hidden
                            onChange={(event) => {
                                handleStoryFiles(event.target.files);
                                event.target.value = "";
                            }}
                        />

                        <div className="social-story-source-row">
                            <button type="button" onClick={() => storyFileInputRef.current?.click()}>
                                <ImagePlus className="h-4 w-4" />
                                Choose media
                            </button>
                            <label>
                                <Link2 className="h-4 w-4" />
                                <input
                                    value={storyUrl}
                                    onChange={(event) => setStoryUrl(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            addStoryUrl();
                                        }
                                    }}
                                    placeholder="Or paste a media URL"
                                />
                                <button type="button" onClick={addStoryUrl} disabled={!storyUrl.trim()}>
                                    Add
                                </button>
                            </label>
                        </div>

                        <label className="social-story-caption-field">
                            <span>Caption</span>
                            <textarea
                                value={storyDraft.caption}
                                onChange={(event) =>
                                    setStoryDraft((currentDraft) => ({
                                        ...currentDraft,
                                        caption: event.target.value,
                                    }))
                                }
                                rows={3}
                                maxLength={240}
                                placeholder="What happened?"
                            />
                            <small>{storyDraft.caption.length}/240</small>
                        </label>

                        <footer className="social-dialog-footer">
                            <button type="button" onClick={resetStoryComposer}>Cancel</button>
                            <button type="button" className="primary" onClick={publishStory} disabled={!storyDraft.src}>
                                <Send className="h-4 w-4" />
                                Share story
                            </button>
                        </footer>
                    </section>
                </div>
            )}

            {activeStory && (
                <div className="social-story-viewer-backdrop" role="presentation" onMouseDown={() => setActiveStoryId(null)}>
                    <section
                        id={`story-${activeStory.id}`}
                        className={`social-story-viewer tone-${activeStory.tone}`}
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${activeStory.name}'s story`}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="social-story-progress" aria-hidden="true">
                            {stories.map((story) => (
                                <span key={story.id} className={story.id === activeStory.id ? "active" : ""} />
                            ))}
                        </div>
                        <header>
                            <span className={`social-avatar tone-${activeStory.tone}`}>{getInitials(activeStory.name)}</span>
                            <div>
                                {activeStoryProfileRoute ? (
                                    <Link to={activeStoryProfileRoute} className="social-story-profile-link" onClick={() => setActiveStoryId(null)}>
                                        {activeStory.name}
                                    </Link>
                                ) : (
                                    <strong>{activeStory.name}</strong>
                                )}
                                <small>{activeStory.metric} | {activeStory.detail}</small>
                            </div>
                            {activeStory.isOwn && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        deleteStory(activeStory.id);
                                        setActiveStoryId(null);
                                        showToast("Story deleted");
                                    }}
                                    aria-label="Delete story"
                                    title="Delete story"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            )}
                            <button type="button" onClick={() => setActiveStoryId(null)} aria-label="Close story">
                                <X className="h-5 w-5" />
                            </button>
                        </header>

                        <div className="social-story-media">
                            {activeStory.type === "video" ? (
                                <video src={activeStory.src} controls autoPlay muted playsInline />
                            ) : (
                                <img src={activeStory.src} alt={activeStory.caption || `${activeStory.name}'s story`} />
                            )}
                            <button type="button" className="previous" onClick={() => moveStory(-1)} aria-label="Previous story">
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button type="button" className="next" onClick={() => moveStory(1)} aria-label="Next story">
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </div>

                        <footer>
                            <p>{activeStory.caption || activeStory.detail}</p>
                            <button type="button" onClick={() => openSharePanel("story", activeStory)}>
                                <Send className="h-4 w-4" />
                                Send story
                            </button>
                        </footer>
                    </section>
                </div>
            )}

            {shareTarget && (
                <div className="social-dialog-backdrop" role="presentation" onMouseDown={() => setShareTarget(null)}>
                    <section
                        className="social-dialog social-share-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="social-share-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <header className="social-dialog-header">
                            <div>
                                <p className="social-kicker">Share</p>
                                <h2 id="social-share-title">
                                    Send {shareTarget.itemType === "story" ? "story" : "post"}
                                </h2>
                            </div>
                            <button type="button" onClick={() => setShareTarget(null)} aria-label="Close share panel">
                                <X className="h-5 w-5" />
                            </button>
                        </header>

                        <div className="social-share-preview">
                            <span className={`social-avatar tone-${shareTarget.item.tone || "green"}`}>
                                {getInitials(shareTarget.item.name)}
                            </span>
                            <div>
                                <strong>{shareTarget.item.name}</strong>
                                <p>{shareTarget.item.caption || shareTarget.item.detail || shareTarget.item.action}</p>
                            </div>
                        </div>

                        <div className="social-share-threads">
                            {dmThreads.map((thread) => {
                                const wasSent = sentThreadIds.includes(thread.id);
                                return (
                                    <button
                                        type="button"
                                        key={thread.id}
                                        className={wasSent ? "sent" : ""}
                                        onClick={() => sendItemToThread(thread)}
                                        disabled={wasSent}
                                    >
                                        <span className={`social-avatar tone-${thread.tone}`}>{getInitials(thread.name)}</span>
                                        <span>
                                            <strong>{thread.name}</strong>
                                            <small>{thread.preview}</small>
                                        </span>
                                        {wasSent ? <Check className="h-5 w-5" /> : <Send className="h-4 w-4" />}
                                    </button>
                                );
                            })}
                        </div>

                        <footer className="social-share-options">
                            <button type="button" onClick={copyShareLink}>
                                <Clipboard className="h-4 w-4" />
                                Copy link
                            </button>
                            {typeof navigator !== "undefined" && navigator.share && (
                                <button type="button" onClick={shareWithDevice}>
                                    <Send className="h-4 w-4" />
                                    More options
                                </button>
                            )}
                            <Link to="/messages" onClick={() => setShareTarget(null)}>
                                <MessageCircle className="h-4 w-4" />
                                Open messages
                            </Link>
                        </footer>
                    </section>
                </div>
            )}

            {toast && (
                <div className="social-toast" role="status" aria-live="polite">
                    <Check className="h-4 w-4" />
                    {toast}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
