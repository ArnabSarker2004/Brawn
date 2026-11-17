import {
    Bookmark,
    Check,
    ChevronDown,
    ChevronUp,
    Clipboard,
    EyeOff,
    Flag,
    Heart,
    MessageCircle,
    MoreHorizontal,
    Music2,
    Pause,
    Play,
    Plus,
    Repeat2,
    RotateCcw,
    Search,
    Send,
    Sparkles,
    Trash2,
    UserRound,
    Volume2,
    VolumeX,
    X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocialPosts } from "../context/SocialPostsContext";
import { getProfileRoute } from "../utils/socialProfiles";

const clips = [
    {
        id: "top-set",
        title: "Top Set: Incline Press",
        creator: "maya.moves",
        creatorName: "Maya Chen",
        messageThreadId: "maya",
        initials: "MC",
        tag: "Hypertrophy",
        metric: "2 RIR",
        caption: "Controlled eccentric, slight pause, clean back-off target.",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=85",
        likes: 1800,
        comments: 142,
        shares: 51,
        saves: 244,
        reposts: 37,
        duration: 18,
        audio: "Maya Moves - Push day top set",
        accent: "#fb7185",
        tone: "pink",
        seedComments: [
            { id: "top-set-comment-1", author: "Jordan", text: "That pause was clean.", time: "8m" },
            { id: "top-set-comment-2", author: "Sam", text: "The back-off set is going to fly.", time: "14m" },
        ],
    },
    {
        id: "lengthened",
        title: "Lengthened-Biased Pulldown",
        creator: "coach.ai",
        creatorName: "Coach AI",
        messageThreadId: "coach",
        initials: "CA",
        tag: "Technique",
        metric: "12-15 reps",
        caption: "Keep the rib cage stacked and own the stretched position.",
        image: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=1200&q=85",
        likes: 3200,
        comments: 268,
        shares: 84,
        saves: 511,
        reposts: 91,
        duration: 21,
        audio: "Coach AI - Lat path cue",
        accent: "#38bdf8",
        tone: "blue",
        seedComments: [
            { id: "lengthened-comment-1", author: "Maya", text: "The stacked-rib cue fixed this immediately.", time: "3m" },
        ],
    },
    {
        id: "posterior",
        title: "Posterior Chain Block",
        creator: "sam.bulks",
        creatorName: "Sam Patel",
        messageThreadId: "sam",
        initials: "SP",
        tag: "Strength",
        metric: "Top + back-off",
        caption: "Heavy hinge, hamstring bias, then glute pump work.",
        image: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=1200&q=85",
        likes: 2400,
        comments: 187,
        shares: 63,
        saves: 389,
        reposts: 54,
        duration: 16,
        audio: "Sam Bulks - Heavy hinge day",
        accent: "#a78bfa",
        tone: "violet",
        seedComments: [
            { id: "posterior-comment-1", author: "Coach AI", text: "Good position through the entire hinge.", time: "22m" },
        ],
    },
    {
        id: "conditioning",
        title: "Zone 2 Finish",
        creator: "runwithjo",
        creatorName: "Jordan Miles",
        messageThreadId: "jordan",
        initials: "JM",
        tag: "Conditioning",
        metric: "18 min",
        caption: "Easy nasal pace after lower day to keep recovery honest.",
        image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=85",
        likes: 980,
        comments: 74,
        shares: 29,
        saves: 126,
        reposts: 18,
        duration: 20,
        audio: "Run With Jo - Cooldown tempo",
        accent: "#22c55e",
        tone: "green",
        seedComments: [
            { id: "conditioning-comment-1", author: "Maya", text: "Stealing this after tomorrow's lower session.", time: "31m" },
        ],
    },
];

const filters = ["For You", "Following", "Hypertrophy", "Technique", "Strength", "Conditioning"];
const shareThreads = [
    { id: "maya", name: "Maya", tone: "pink", initials: "MC" },
    { id: "coach", name: "Coach AI", tone: "green", initials: "CA" },
    { id: "jordan", name: "Jordan", tone: "blue", initials: "JM" },
    { id: "sam", name: "Sam", tone: "gold", initials: "SP" },
    { id: "nia", name: "Nia", tone: "violet", initials: "NB" },
    { id: "alex", name: "Alex", tone: "orange", initials: "AR" },
    { id: "taylor", name: "Taylor", tone: "blue", initials: "TS" },
    { id: "riley", name: "Riley", tone: "green", initials: "RK" },
    { id: "avery", name: "Avery", tone: "pink", initials: "AJ" },
    { id: "marcus", name: "Marcus", tone: "gold", initials: "MW" },
    { id: "zoe", name: "Zoe", tone: "violet", initials: "ZL" },
    { id: "kai", name: "Kai", tone: "orange", initials: "KN" },
    { id: "priya", name: "Priya", tone: "green", initials: "PM" },
    { id: "leo", name: "Leo", tone: "blue", initials: "LC" },
    { id: "imani", name: "Imani", tone: "pink", initials: "IR" },
    { id: "noah", name: "Noah", tone: "gold", initials: "NP" },
];
const reportReasons = ["Spam or misleading", "Unsafe training advice", "Harassment", "I do not want to see this"];
const STORAGE_KEYS = {
    following: "brawn-reels-following",
    hidden: "brawn-reels-hidden",
    reported: "brawn-reels-reported",
};

const readStoredIds = (key, fallback = []) => {
    if (typeof window === "undefined") return new Set(fallback);
    try {
        const value = JSON.parse(window.localStorage.getItem(key) || "null");
        return new Set(Array.isArray(value) ? value : fallback);
    } catch {
        return new Set(fallback);
    }
};

const writeStoredIds = (key, ids) => {
    try {
        window.localStorage.setItem(key, JSON.stringify([...ids]));
    } catch {}
};

const formatCount = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}m`;
    if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
    return String(value);
};

const getInitialClipId = () => {
    if (typeof window === "undefined") return clips[0].id;
    return new URLSearchParams(window.location.search).get("reel") || clips[0].id;
};

const Reels = () => {
    const { user } = useAuth();
    const {
        likedPostIds,
        savedPostIds,
        commentsByPost,
        shareCounts,
        repostedPostIds,
        toggleLikePost,
        toggleSavePost,
        addComment,
        removeComment,
        toggleRepostPost,
        sendSocialItem,
        incrementShareCount,
    } = useSocialPosts();
    const [activeFilter, setActiveFilter] = useState("For You");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeClipId, setActiveClipId] = useState(getInitialClipId);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [progressByClip, setProgressByClip] = useState({});
    const [followedCreators, setFollowedCreators] = useState(() => readStoredIds(STORAGE_KEYS.following, ["coach.ai"]));
    const [hiddenClipIds, setHiddenClipIds] = useState(() => readStoredIds(STORAGE_KEYS.hidden));
    const [reportedClipIds, setReportedClipIds] = useState(() => readStoredIds(STORAGE_KEYS.reported));
    const [expandedCaptionIds, setExpandedCaptionIds] = useState(new Set());
    const [activeCommentsClipId, setActiveCommentsClipId] = useState(null);
    const [commentDrafts, setCommentDrafts] = useState({});
    const [shareClip, setShareClip] = useState(null);
    const [shareSearchQuery, setShareSearchQuery] = useState("");
    const [selectedShareThreadIds, setSelectedShareThreadIds] = useState([]);
    const [sentThreadIds, setSentThreadIds] = useState([]);
    const [moreClip, setMoreClip] = useState(null);
    const [creatorClip, setCreatorClip] = useState(null);
    const [audioClip, setAudioClip] = useState(null);
    const [reportClip, setReportClip] = useState(null);
    const [reportReason, setReportReason] = useState("");
    const [toast, setToast] = useState("");
    const feedRef = useRef(null);
    const cardRefs = useRef(new Map());
    const scrollFrameRef = useRef(null);
    const initialClipIdRef = useRef(activeClipId);
    const capitalizedName = user ? user.charAt(0).toUpperCase() + user.slice(1) : "You";

    const visibleClips = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return clips.filter((clip) => {
            if (hiddenClipIds.has(clip.id) || reportedClipIds.has(clip.id)) return false;
            const matchesFilter =
                activeFilter === "For You" ||
                (activeFilter === "Following" && followedCreators.has(clip.creator)) ||
                clip.tag === activeFilter;
            const matchesSearch =
                !query ||
                [clip.title, clip.creator, clip.creatorName, clip.tag, clip.metric, clip.caption, clip.audio]
                    .some((value) => value.toLowerCase().includes(query));

            return matchesFilter && matchesSearch;
        });
    }, [activeFilter, followedCreators, hiddenClipIds, reportedClipIds, searchQuery]);

    const activeCommentsClip = clips.find((clip) => clip.id === activeCommentsClipId) || null;
    const hasOpenPanel = Boolean(activeCommentsClip || shareClip || moreClip || creatorClip || audioClip || reportClip);
    const filteredShareThreads = useMemo(() => {
        const query = shareSearchQuery.trim().toLowerCase();
        if (!query) return shareThreads;

        return shareThreads.filter((thread) =>
            [thread.name, thread.id, thread.initials].some((value) => value.toLowerCase().includes(query))
        );
    }, [shareSearchQuery]);

    useEffect(() => {
        if (!visibleClips.length) {
            setIsPlaying(false);
            return;
        }
        if (!visibleClips.some((clip) => clip.id === activeClipId)) {
            setActiveClipId(visibleClips[0].id);
            setIsPlaying(true);
        }
    }, [activeClipId, visibleClips]);

    useEffect(() => {
        if (!isPlaying || !activeClipId) return undefined;
        const clip = clips.find((candidate) => candidate.id === activeClipId);
        if (!clip) return undefined;

        const intervalId = window.setInterval(() => {
            setProgressByClip((currentProgress) => {
                const nextProgress = Math.min(100, (currentProgress[activeClipId] || 0) + 100 / (clip.duration * 4));
                if (nextProgress >= 100) {
                    window.setTimeout(() => setIsPlaying(false), 0);
                }
                return { ...currentProgress, [activeClipId]: nextProgress };
            });
        }, 250);

        return () => window.clearInterval(intervalId);
    }, [activeClipId, isPlaying]);

    useEffect(() => {
        if (!toast) return undefined;
        const timeoutId = window.setTimeout(() => setToast(""), 2400);
        return () => window.clearTimeout(timeoutId);
    }, [toast]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setActiveCommentsClipId(null);
                setShareClip(null);
                setMoreClip(null);
                setCreatorClip(null);
                setAudioClip(null);
                setReportClip(null);
                setReportReason("");
                setIsPlaying(true);
                return;
            }
            if (event.target.closest("input, textarea, select") || document.querySelector('[aria-modal="true"]')) return;
            if (event.key === "ArrowDown") {
                event.preventDefault();
                moveToClip(1);
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                moveToClip(-1);
            } else if (event.key === " ") {
                event.preventDefault();
                togglePlayback(activeClipId);
            } else if (event.key.toLowerCase() === "m") {
                setIsMuted((muted) => !muted);
            } else if (event.key.toLowerCase() === "l") {
                toggleLikePost(activeClipId);
            } else if (event.key.toLowerCase() === "c") {
                setActiveCommentsClipId(activeClipId);
                setIsPlaying(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    });

    useEffect(() => {
        const initialClipId = initialClipIdRef.current;
        if (!initialClipId) return undefined;
        const timeoutId = window.setTimeout(() => {
            cardRefs.current.get(initialClipId)?.scrollIntoView({ block: "start" });
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, []);

    const showToast = (message) => {
        setToast("");
        window.requestAnimationFrame(() => setToast(message));
    };

    const moveToClip = (direction) => {
        if (!visibleClips.length) return;
        const currentIndex = Math.max(0, visibleClips.findIndex((clip) => clip.id === activeClipId));
        const nextIndex = Math.min(visibleClips.length - 1, Math.max(0, currentIndex + direction));
        const nextClip = visibleClips[nextIndex];
        setActiveClipId(nextClip.id);
        setIsPlaying(true);
        cardRefs.current.get(nextClip.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleFeedScroll = () => {
        if (scrollFrameRef.current) window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = window.requestAnimationFrame(() => {
            const feed = feedRef.current;
            if (!feed) return;
            const feedCenter = feed.getBoundingClientRect().top + feed.clientHeight / 2;
            let nearestClip = null;
            let nearestDistance = Number.POSITIVE_INFINITY;

            visibleClips.forEach((clip) => {
                const card = cardRefs.current.get(clip.id);
                if (!card) return;
                const rect = card.getBoundingClientRect();
                const distance = Math.abs(rect.top + rect.height / 2 - feedCenter);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestClip = clip;
                }
            });

            if (nearestClip && nearestClip.id !== activeClipId) {
                setActiveClipId(nearestClip.id);
                setIsPlaying(true);
            }
        });
    };

    const togglePlayback = (clipId) => {
        if (clipId !== activeClipId) {
            setActiveClipId(clipId);
            setIsPlaying(true);
            return;
        }
        if ((progressByClip[clipId] || 0) >= 100) {
            setProgressByClip((current) => ({ ...current, [clipId]: 0 }));
            setIsPlaying(true);
            return;
        }
        setIsPlaying((playing) => !playing);
    };

    const toggleFollow = (clip) => {
        setFollowedCreators((currentCreators) => {
            const nextCreators = new Set(currentCreators);
            const isFollowing = nextCreators.has(clip.creator);
            if (isFollowing) nextCreators.delete(clip.creator);
            else nextCreators.add(clip.creator);
            writeStoredIds(STORAGE_KEYS.following, nextCreators);
            showToast(isFollowing ? `Unfollowed @${clip.creator}` : `Following @${clip.creator}`);
            return nextCreators;
        });
    };

    const toggleExpandedCaption = (clipId) => {
        setExpandedCaptionIds((currentIds) => {
            const nextIds = new Set(currentIds);
            if (nextIds.has(clipId)) nextIds.delete(clipId);
            else nextIds.add(clipId);
            return nextIds;
        });
    };

    const makeSocialPost = (clip) => ({
        id: clip.id,
        name: clip.creatorName,
        handle: clip.creator,
        action: `Shared ${clip.title}`,
        detail: clip.caption,
        stat: clip.metric,
        tag: clip.tag,
        kind: "reel",
        tone: clip.tone,
        caption: clip.caption,
        tags: [],
        likes: clip.likes,
        saves: clip.saves,
        reposts: clip.reposts,
        comments: [],
        slides: [{ type: "photo", src: clip.image, alt: clip.title, label: "Reel cover" }],
    });

    const submitComment = (event, clipId) => {
        event.preventDefault();
        const comment = addComment(clipId, commentDrafts[clipId] || "", capitalizedName);
        if (!comment) return;
        setCommentDrafts((currentDrafts) => ({ ...currentDrafts, [clipId]: "" }));
        showToast("Comment posted");
    };

    const openShare = (clip) => {
        setSentThreadIds([]);
        setSelectedShareThreadIds([]);
        setShareSearchQuery("");
        setShareClip(clip);
        setIsPlaying(false);
    };

    const getShareUrl = (clipId) => `${window.location.origin}/reels?reel=${encodeURIComponent(clipId)}`;

    const sendToThread = (thread) => {
        if (!shareClip || sentThreadIds.includes(thread.id)) return;
        sendSocialItem({
            threadId: thread.id,
            itemId: shareClip.id,
            itemType: "reel",
            title: shareClip.title,
            preview: shareClip.caption,
            url: getShareUrl(shareClip.id),
        });
        setSentThreadIds((currentIds) => [...currentIds, thread.id]);
        showToast(`Sent to ${thread.name}`);
    };

    const toggleShareThread = (thread) => {
        if (sentThreadIds.includes(thread.id)) return;
        setSelectedShareThreadIds((currentIds) =>
            currentIds.includes(thread.id)
                ? currentIds.filter((id) => id !== thread.id)
                : [...currentIds, thread.id]
        );
    };

    const sendSelectedThreads = () => {
        const recipients = shareThreads.filter((thread) => selectedShareThreadIds.includes(thread.id));
        if (!recipients.length) return;

        recipients.forEach((thread) => sendToThread(thread));
        setSelectedShareThreadIds([]);
    };

    const copyShareLink = async (clip) => {
        const shareUrl = getShareUrl(clip.id);
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
        incrementShareCount(clip.id);
        setMoreClip(null);
        showToast("Reel link copied");
    };

    const shareWithDevice = async () => {
        if (!shareClip || !navigator.share) return;
        try {
            await navigator.share({
                title: shareClip.title,
                text: shareClip.caption,
                url: getShareUrl(shareClip.id),
            });
            incrementShareCount(shareClip.id);
            showToast("Reel shared");
        } catch (error) {
            if (error?.name !== "AbortError") showToast("Share was not completed");
        }
    };

    const hideClip = (clip) => {
        setHiddenClipIds((currentIds) => {
            const nextIds = new Set(currentIds);
            nextIds.add(clip.id);
            writeStoredIds(STORAGE_KEYS.hidden, nextIds);
            return nextIds;
        });
        setMoreClip(null);
        showToast("Reel hidden from your feed");
    };

    const resetFeed = () => {
        const emptyIds = new Set();
        setHiddenClipIds(emptyIds);
        setReportedClipIds(emptyIds);
        writeStoredIds(STORAGE_KEYS.hidden, emptyIds);
        writeStoredIds(STORAGE_KEYS.reported, emptyIds);
        setSearchQuery("");
        setActiveFilter("For You");
        setActiveClipId(clips[0].id);
        setIsPlaying(true);
        showToast("Reels feed reset");
    };

    const submitReport = (event) => {
        event.preventDefault();
        if (!reportClip || !reportReason) return;
        setReportedClipIds((currentIds) => {
            const nextIds = new Set(currentIds);
            nextIds.add(reportClip.id);
            writeStoredIds(STORAGE_KEYS.reported, nextIds);
            return nextIds;
        });
        setReportClip(null);
        setMoreClip(null);
        setReportReason("");
        setIsPlaying(true);
        showToast("Report submitted");
    };

    const closeOverlay = (setter) => {
        setter(null);
        setIsPlaying(true);
    };

    return (
        <div className={`reels-page ${hasOpenPanel ? "has-side-panel" : ""}`}>
            <header className="reels-topbar">
                <div className="reels-brand">
                    <Sparkles className="h-4 w-4" />
                    <span>Brawn Reels</span>
                </div>

                <nav className="reels-filter-row" aria-label="Reels feed filters">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            type="button"
                            className={activeFilter === filter ? "active" : ""}
                            onClick={() => {
                                setActiveFilter(filter);
                                setIsPlaying(true);
                            }}
                            aria-pressed={activeFilter === filter}
                        >
                            {filter}
                        </button>
                    ))}
                </nav>

                <label className="reels-search">
                    <Search className="h-4 w-4" />
                    <input
                        type="search"
                        placeholder="Search reels"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                    {searchQuery && (
                        <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear reels search">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </label>
            </header>

            <main ref={feedRef} className="reels-feed" aria-label="Vertical reels feed" onScroll={handleFeedScroll}>
                {visibleClips.map((clip, index) => {
                    const isActive = clip.id === activeClipId;
                    const isLiked = likedPostIds.includes(clip.id);
                    const isSaved = savedPostIds.includes(clip.id);
                    const isFollowing = followedCreators.has(clip.creator);
                    const isReposted = repostedPostIds.includes(clip.id);
                    const isExpanded = expandedCaptionIds.has(clip.id);
                    const userComments = commentsByPost[clip.id] || [];
                    const commentCount = clip.comments + userComments.length;
                    const progress = progressByClip[clip.id] || 0;
                    const creatorProfileRoute = getProfileRoute(clip.creator, user);

                    return (
                        <article
                            key={clip.id}
                            ref={(element) => {
                                if (element) cardRefs.current.set(clip.id, element);
                                else cardRefs.current.delete(clip.id);
                            }}
                            id={`reel-${clip.id}`}
                            className={`reels-card ${isActive ? "is-active" : ""} ${isPlaying && isActive ? "is-playing" : "is-paused"}`}
                            style={{ "--reel-accent": clip.accent }}
                            aria-label={`${clip.title} by ${clip.creatorName}`}
                            onDoubleClick={() => {
                                if (!isLiked) {
                                    toggleLikePost(clip.id);
                                    showToast("Reel liked");
                                }
                            }}
                        >
                            <img className="reels-video-poster" src={clip.image} alt={clip.title} />
                            <div className="reels-vignette" aria-hidden="true" />

                            <div className="reels-card-top">
                                <span>{isActive ? (isPlaying ? "Now playing" : "Paused") : clip.tag}</span>
                                <button
                                    type="button"
                                    className={isMuted ? "is-muted" : ""}
                                    onClick={() => setIsMuted((muted) => !muted)}
                                    aria-label={isMuted ? "Unmute clip" : "Mute clip"}
                                    aria-pressed={!isMuted}
                                >
                                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                </button>
                            </div>

                            <button
                                className="reels-play-button"
                                type="button"
                                onClick={() => togglePlayback(clip.id)}
                                aria-label={`${isActive && isPlaying ? "Pause" : progress >= 100 ? "Replay" : "Play"} ${clip.title}`}
                            >
                                {progress >= 100 ? (
                                    <RotateCcw className="h-8 w-8" />
                                ) : isActive && isPlaying ? (
                                    <Pause className="h-8 w-8" fill="currentColor" />
                                ) : (
                                    <Play className="h-9 w-9" fill="currentColor" />
                                )}
                            </button>

                            <aside className="reels-action-rail" aria-label={`${clip.title} actions`}>
                                <button
                                    className={`reels-profile-action ${isFollowing ? "is-following" : ""}`}
                                    type="button"
                                    onClick={() => toggleFollow(clip)}
                                    aria-label={`${isFollowing ? "Unfollow" : "Follow"} ${clip.creator}`}
                                    aria-pressed={isFollowing}
                                >
                                    <span>{clip.initials}</span>
                                    <span className="reels-follow-badge">
                                        {isFollowing ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                                    </span>
                                </button>
                                <button
                                    className={`reels-rail-button ${isLiked ? "is-active" : ""}`}
                                    type="button"
                                    aria-label={isLiked ? "Unlike clip" : "Like clip"}
                                    aria-pressed={isLiked}
                                    onClick={() => {
                                        toggleLikePost(clip.id);
                                        showToast(isLiked ? "Like removed" : "Reel liked");
                                    }}
                                >
                                    <span className="reels-action-icon">
                                        <Heart className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} />
                                    </span>
                                    <span className="reels-action-count">{formatCount(clip.likes + (isLiked ? 1 : 0))}</span>
                                </button>
                                <button
                                    className="reels-rail-button"
                                    type="button"
                                    aria-label="View comments"
                                    onClick={() => {
                                        setActiveCommentsClipId(clip.id);
                                        setIsPlaying(false);
                                    }}
                                >
                                    <span className="reels-action-icon">
                                        <MessageCircle className="h-5 w-5" />
                                    </span>
                                    <span className="reels-action-count">{formatCount(commentCount)}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`reels-rail-button ${isReposted ? "is-reposted" : ""}`}
                                    aria-label={isReposted ? "Remove repost" : "Repost clip"}
                                    aria-pressed={isReposted}
                                    onClick={() => {
                                        toggleRepostPost(makeSocialPost(clip));
                                        showToast(isReposted ? "Repost removed" : "Reposted to Home");
                                    }}
                                >
                                    <span className="reels-action-icon">
                                        <Repeat2 className="h-5 w-5" />
                                    </span>
                                    <span className="reels-action-count">{formatCount(clip.reposts + (isReposted ? 1 : 0))}</span>
                                </button>
                                <button className="reels-rail-button" type="button" aria-label="Share clip" onClick={() => openShare(clip)}>
                                    <span className="reels-action-icon">
                                        <Send className="h-5 w-5" />
                                    </span>
                                    <span className="reels-action-count">{formatCount(clip.shares + (shareCounts[clip.id] || 0))}</span>
                                </button>
                                <button
                                    className={`reels-rail-button ${isSaved ? "is-saved" : ""}`}
                                    type="button"
                                    aria-label={isSaved ? "Remove saved clip" : "Save clip"}
                                    aria-pressed={isSaved}
                                    onClick={() => {
                                        toggleSavePost(clip.id);
                                        showToast(isSaved ? "Removed from saved reels" : "Reel saved");
                                    }}
                                >
                                    <span className="reels-action-icon">
                                        <Bookmark className="h-5 w-5" fill={isSaved ? "currentColor" : "none"} />
                                    </span>
                                    <span className="reels-action-count">{formatCount(clip.saves + (isSaved ? 1 : 0))}</span>
                                </button>
                                <button
                                    className="reels-rail-button"
                                    type="button"
                                    aria-label="More options"
                                    onClick={() => {
                                        setMoreClip(clip);
                                        setIsPlaying(false);
                                    }}
                                >
                                    <span className="reels-action-icon">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </span>
                                    <span className="reels-action-count">More</span>
                                </button>
                            </aside>

                            <section className="reels-copy">
                                <div className="reels-creator-row">
                                    <Link
                                        to={creatorProfileRoute || "/discover"}
                                        className="reels-avatar"
                                        aria-label={`View ${clip.creatorName}'s profile`}
                                    >
                                        {clip.initials}
                                    </Link>
                                    <Link
                                        to={creatorProfileRoute || "/discover"}
                                        className="reels-creator-name"
                                    >
                                        @{clip.creator}
                                    </Link>
                                    <button type="button" className={isFollowing ? "following" : ""} onClick={() => toggleFollow(clip)}>
                                        {isFollowing ? "Following" : "Follow"}
                                    </button>
                                </div>
                                <h1>{clip.title}</h1>
                                <button
                                    type="button"
                                    className={`reels-caption ${isExpanded ? "expanded" : ""}`}
                                    onClick={() => toggleExpandedCaption(clip.id)}
                                    aria-expanded={isExpanded}
                                >
                                    {clip.caption}
                                    <span>{isExpanded ? "Less" : "More"}</span>
                                </button>
                                <div className="reels-meta-row">
                                    <span>{clip.tag}</span>
                                    <span>{clip.metric}</span>
                                    <span>{clip.duration}s</span>
                                </div>
                                <button
                                    type="button"
                                    className="reels-audio-row"
                                    onClick={() => {
                                        setAudioClip(clip);
                                        setIsPlaying(false);
                                    }}
                                >
                                    <Music2 className="h-4 w-4" />
                                    <span>{clip.audio}</span>
                                </button>
                            </section>

                            <label className="reels-seek" aria-label={`Seek ${clip.title}`}>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={Math.round(progress)}
                                    style={{ "--reels-progress": `${progress}%` }}
                                    onChange={(event) => {
                                        setActiveClipId(clip.id);
                                        setProgressByClip((current) => ({
                                            ...current,
                                            [clip.id]: Number(event.target.value),
                                        }));
                                    }}
                                />
                            </label>
                        </article>
                    );
                })}

                {visibleClips.length === 0 && (
                    <section className="reels-empty-state">
                        <Search className="h-7 w-7" />
                        <h2>No reels found</h2>
                        <p>Try a different cue, creator, or training style.</p>
                        <button type="button" onClick={resetFeed}>
                            <RotateCcw className="h-4 w-4" />
                            Reset feed
                        </button>
                    </section>
                )}
            </main>

            {visibleClips.length > 1 && (
                <div className="reels-navigation-controls" aria-label="Reel navigation">
                    <button type="button" onClick={() => moveToClip(-1)} aria-label="Previous reel">
                        <ChevronUp className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={() => moveToClip(1)} aria-label="Next reel">
                        <ChevronDown className="h-5 w-5" />
                    </button>
                </div>
            )}

            {activeCommentsClip && (
                <div className="reels-overlay" role="presentation" onMouseDown={() => closeOverlay(setActiveCommentsClipId)}>
                    <aside
                        className="reels-comments-sheet"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reels-comments-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <header>
                            <div>
                                <p>Conversation</p>
                                <h2 id="reels-comments-title">Comments</h2>
                            </div>
                            <button type="button" onClick={() => closeOverlay(setActiveCommentsClipId)} aria-label="Close comments">
                                <X className="h-5 w-5" />
                            </button>
                        </header>
                        <div className="reels-comments-summary">
                            <img src={activeCommentsClip.image} alt="" />
                            <div>
                                <strong>{activeCommentsClip.title}</strong>
                                <span>@{activeCommentsClip.creator}</span>
                            </div>
                        </div>
                        <div className="reels-comment-list">
                            {[...activeCommentsClip.seedComments, ...(commentsByPost[activeCommentsClip.id] || [])].map((comment) => (
                                <article key={comment.id} className="reels-comment">
                                    <span>{comment.author.slice(0, 2).toUpperCase()}</span>
                                    <div>
                                        <header>
                                            <strong>{comment.author}</strong>
                                            <small>{comment.time || "Now"}</small>
                                            {comment.isOwn && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeComment(activeCommentsClip.id, comment.id)}
                                                    aria-label="Delete comment"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </header>
                                        <p>{comment.text}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                        <form onSubmit={(event) => submitComment(event, activeCommentsClip.id)}>
                            <span>{capitalizedName.slice(0, 2).toUpperCase()}</span>
                            <textarea
                                rows={1}
                                value={commentDrafts[activeCommentsClip.id] || ""}
                                onChange={(event) =>
                                    setCommentDrafts((currentDrafts) => ({
                                        ...currentDrafts,
                                        [activeCommentsClip.id]: event.target.value,
                                    }))
                                }
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && !event.shiftKey) {
                                        event.preventDefault();
                                        submitComment(event, activeCommentsClip.id);
                                    }
                                }}
                                maxLength={400}
                                placeholder="Add a comment..."
                                aria-label={`Comment on ${activeCommentsClip.title}`}
                            />
                            <button type="submit" disabled={!commentDrafts[activeCommentsClip.id]?.trim()} aria-label="Post comment">
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </aside>
                </div>
            )}

            {shareClip && (
                <div className="reels-overlay" role="presentation" onMouseDown={() => closeOverlay(setShareClip)}>
                    <section
                        className="reels-dialog reels-share-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reels-share-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <header>
                            <div>
                                <p>Share reel</p>
                                <h2 id="reels-share-title">{shareClip.title}</h2>
                            </div>
                            <button type="button" onClick={() => closeOverlay(setShareClip)} aria-label="Close share dialog">
                                <X className="h-5 w-5" />
                            </button>
                        </header>
                        <div className="reels-share-search">
                            <Search className="h-4 w-4" />
                            <input
                                type="search"
                                value={shareSearchQuery}
                                onChange={(event) => setShareSearchQuery(event.target.value)}
                                placeholder="Search friends"
                                aria-label="Search friends to share this reel"
                            />
                            {shareSearchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setShareSearchQuery("")}
                                    aria-label="Clear share search"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                        <div className="reels-share-quick-actions" aria-label="Share options">
                            <button type="button" onClick={() => copyShareLink(shareClip)}>
                                <Clipboard className="h-4 w-4" />
                                Copy link
                            </button>
                            {typeof navigator !== "undefined" && navigator.share && (
                                <button type="button" onClick={shareWithDevice}>
                                    <Send className="h-4 w-4" />
                                    More options
                                </button>
                            )}
                            <Link to="/messages" onClick={() => setShareClip(null)}>
                                <MessageCircle className="h-4 w-4" />
                                Messages
                            </Link>
                        </div>
                        <div className="reels-share-threads">
                            {filteredShareThreads.map((thread) => {
                                const wasSent = sentThreadIds.includes(thread.id);
                                const isSelected = selectedShareThreadIds.includes(thread.id);
                                return (
                                    <button
                                        key={thread.id}
                                        type="button"
                                        className={`${isSelected ? "selected" : ""} ${wasSent ? "sent" : ""}`}
                                        onClick={() => toggleShareThread(thread)}
                                        disabled={wasSent}
                                        aria-pressed={isSelected}
                                    >
                                        <span className={`tone-${thread.tone}`}>{thread.initials}</span>
                                        <strong>{thread.name}</strong>
                                        <small>{wasSent ? "Sent" : isSelected ? "Selected" : `@${thread.id}`}</small>
                                        <em>{wasSent || isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}</em>
                                    </button>
                                );
                            })}
                            {filteredShareThreads.length === 0 && (
                                <div className="reels-share-empty">
                                    <Search className="h-5 w-5" />
                                    <strong>No friends found</strong>
                                    <span>Try a name or username.</span>
                                </div>
                            )}
                        </div>
                        <footer>
                            <button
                                type="button"
                                className="reels-share-send-selected"
                                onClick={sendSelectedThreads}
                                disabled={!selectedShareThreadIds.length}
                            >
                                <Send className="h-4 w-4" />
                                {selectedShareThreadIds.length
                                    ? `Send to ${selectedShareThreadIds.length}`
                                    : "Select friends"}
                            </button>
                        </footer>
                    </section>
                </div>
            )}

            {moreClip && (
                <div className="reels-overlay" role="presentation" onMouseDown={() => closeOverlay(setMoreClip)}>
                    <section
                        className="reels-dialog reels-more-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`More options for ${moreClip.title}`}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <header>
                            <div>
                                <p>Reel options</p>
                                <h2>{moreClip.title}</h2>
                            </div>
                            <button type="button" onClick={() => closeOverlay(setMoreClip)} aria-label="Close reel options">
                                <X className="h-5 w-5" />
                            </button>
                        </header>
                        <div className="reels-option-list">
                            <button type="button" onClick={() => copyShareLink(moreClip)}>
                                <Clipboard className="h-5 w-5" />
                                <span><strong>Copy link</strong><small>Share this reel anywhere</small></span>
                            </button>
                            <Link to={getProfileRoute(moreClip.creator, user) || "/discover"} onClick={() => setMoreClip(null)}>
                                <UserRound className="h-5 w-5" />
                                <span><strong>View creator</strong><small>@{moreClip.creator}</small></span>
                            </Link>
                            <button type="button" onClick={() => hideClip(moreClip)}>
                                <EyeOff className="h-5 w-5" />
                                <span><strong>Not interested</strong><small>Hide this reel from your feed</small></span>
                            </button>
                            <button
                                type="button"
                                className="danger"
                                onClick={() => {
                                    setReportClip(moreClip);
                                    setMoreClip(null);
                                }}
                            >
                                <Flag className="h-5 w-5" />
                                <span><strong>Report</strong><small>Tell us what is wrong</small></span>
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {creatorClip && (
                <div className="reels-overlay" role="presentation" onMouseDown={() => closeOverlay(setCreatorClip)}>
                    <section
                        className="reels-dialog reels-creator-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${creatorClip.creatorName}'s profile`}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <button type="button" className="reels-dialog-close" onClick={() => closeOverlay(setCreatorClip)} aria-label="Close creator profile">
                            <X className="h-5 w-5" />
                        </button>
                        <span className="reels-creator-dialog-avatar" style={{ background: creatorClip.accent }}>{creatorClip.initials}</span>
                        <h2>{creatorClip.creatorName}</h2>
                        <p>@{creatorClip.creator}</p>
                        <div className="reels-creator-stats">
                            <span><strong>{formatCount(creatorClip.likes * 6)}</strong> likes</span>
                            <span><strong>{formatCount(creatorClip.saves * 4)}</strong> saves</span>
                            <span><strong>{creatorClip.tag}</strong> focus</span>
                        </div>
                        <div className="reels-creator-actions">
                            <Link to={getProfileRoute(creatorClip.creator, user) || "/discover"}>
                                <UserRound className="h-4 w-4" />
                                View profile
                            </Link>
                            <button type="button" className="primary" onClick={() => toggleFollow(creatorClip)}>
                                {followedCreators.has(creatorClip.creator) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                {followedCreators.has(creatorClip.creator) ? "Following" : "Follow"}
                            </button>
                            <Link to={`/messages?thread=${creatorClip.messageThreadId}`}>
                                <Send className="h-4 w-4" />
                                Message
                            </Link>
                        </div>
                    </section>
                </div>
            )}

            {audioClip && (
                <div className="reels-overlay" role="presentation" onMouseDown={() => closeOverlay(setAudioClip)}>
                    <section
                        className="reels-dialog reels-audio-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reels-audio-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <header>
                            <div>
                                <p>Original audio</p>
                                <h2 id="reels-audio-title">{audioClip.audio}</h2>
                            </div>
                            <button type="button" onClick={() => closeOverlay(setAudioClip)} aria-label="Close audio details">
                                <X className="h-5 w-5" />
                            </button>
                        </header>
                        <div className="reels-audio-hero">
                            <span style={{ background: audioClip.accent }}><Music2 className="h-7 w-7" /></span>
                            <div>
                                <strong>{audioClip.audio}</strong>
                                <small>Original sound by @{audioClip.creator}</small>
                            </div>
                        </div>
                        <div className="reels-audio-matches">
                            {clips.filter((clip) => clip.creator === audioClip.creator).map((clip) => (
                                <button
                                    key={clip.id}
                                    type="button"
                                    onClick={() => {
                                        setAudioClip(null);
                                        setActiveClipId(clip.id);
                                        setIsPlaying(true);
                                        cardRefs.current.get(clip.id)?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                >
                                    <img src={clip.image} alt="" />
                                    <span>{clip.title}</span>
                                </button>
                            ))}
                        </div>
                        <Link className="reels-use-audio" to="/create">
                            <Music2 className="h-4 w-4" />
                            Use this audio
                        </Link>
                    </section>
                </div>
            )}

            {reportClip && (
                <div className="reels-overlay" role="presentation" onMouseDown={() => closeOverlay(setReportClip)}>
                    <form
                        className="reels-dialog reels-report-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reels-report-title"
                        onSubmit={submitReport}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <header>
                            <div>
                                <p>Report reel</p>
                                <h2 id="reels-report-title">What is the issue?</h2>
                            </div>
                            <button type="button" onClick={() => closeOverlay(setReportClip)} aria-label="Close report dialog">
                                <X className="h-5 w-5" />
                            </button>
                        </header>
                        <div className="reels-report-reasons">
                            {reportReasons.map((reason) => (
                                <label key={reason}>
                                    <input
                                        type="radio"
                                        name="report-reason"
                                        value={reason}
                                        checked={reportReason === reason}
                                        onChange={(event) => setReportReason(event.target.value)}
                                    />
                                    <span>{reason}</span>
                                </label>
                            ))}
                        </div>
                        <footer>
                            <button type="button" onClick={() => closeOverlay(setReportClip)}>Cancel</button>
                            <button type="submit" className="danger" disabled={!reportReason}>Submit report</button>
                        </footer>
                    </form>
                </div>
            )}

            {toast && (
                <div className="reels-toast" role="status" aria-live="polite">
                    <Check className="h-4 w-4" />
                    {toast}
                </div>
            )}
        </div>
    );
};

export default Reels;
