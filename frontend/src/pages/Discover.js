import {
    BadgeCheck,
    Bookmark,
    ChevronRight,
    Clock,
    Heart,
    Image as ImageIcon,
    MessageCircle,
    Play,
    Repeat2,
    Search,
    SlidersHorizontal,
    Sparkles,
    UserPlus,
    Video,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocialPosts } from "../context/SocialPostsContext";
import { getProfileRoute } from "../utils/socialProfiles";

const RECENT_SEARCH_KEY = "brawn-discover-recent-searches";

const readRecentSearches = () => {
    if (typeof window === "undefined") return ["push day", "hypertrophy", "zone 2"];

    try {
        const value = window.localStorage.getItem(RECENT_SEARCH_KEY);
        return value ? JSON.parse(value) : ["push day", "hypertrophy", "zone 2"];
    } catch {
        return ["push day", "hypertrophy", "zone 2"];
    }
};

const writeRecentSearches = (searches) => {
    if (typeof window === "undefined") return;

    try {
        window.localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(searches));
    } catch {}
};

const profileRecommendations = [
    {
        id: "maya",
        name: "Maya Chen",
        handle: "maya.moves",
        initials: "MC",
        verified: true,
        specialty: "Lower body strength",
        reason: "Squat blocks and cut challenges",
        stats: "42 workouts",
        tone: "pink",
        tags: ["strength", "legs", "cut", "hypertrophy"],
    },
    {
        id: "coach",
        name: "Coach AI",
        handle: "brawn.coach",
        initials: "AI",
        verified: true,
        specialty: "Technique cues",
        reason: "Form fixes for your next lift",
        stats: "12k saves",
        tone: "green",
        tags: ["technique", "coach", "form", "mobility"],
    },
    {
        id: "jordan",
        name: "Jordan Miles",
        handle: "runwithjo",
        initials: "JM",
        verified: false,
        specialty: "Running and conditioning",
        reason: "Zone 2, intervals, and streaks",
        stats: "7 day streak",
        tone: "blue",
        tags: ["running", "conditioning", "zone 2", "cardio"],
    },
    {
        id: "sam",
        name: "Sam Patel",
        handle: "sam.bulks",
        initials: "SP",
        verified: false,
        specialty: "Bulk programming",
        reason: "Volume ladders and heavy hinges",
        stats: "18 routines",
        tone: "gold",
        tags: ["bulk", "strength", "deadlift", "volume"],
    },
    {
        id: "nia",
        name: "Nia Brooks",
        handle: "liftwithnia",
        initials: "NB",
        verified: true,
        specialty: "Upper body hypertrophy",
        reason: "Push/pull splits and pump work",
        stats: "31 posts",
        tone: "violet",
        tags: ["push", "pull", "hypertrophy", "upper"],
    },
];

const topicSuggestions = [
    "push day",
    "glute growth",
    "zone 2",
    "mobility warmup",
    "deadlift technique",
    "cut challenge",
    "bulk meal prep",
    "bench press",
    "running intervals",
    "shoulder health",
];

const seededDiscoverItems = [
    {
        id: "reel-pulldown",
        type: "reel",
        title: "Lengthened-biased pulldown",
        creator: "Coach AI",
        handle: "brawn.coach",
        metric: "12-15 reps",
        image: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=900&q=85",
        tags: ["technique", "back", "hypertrophy", "pulldown"],
        height: "tall",
        tone: "blue",
        likes: "3.2k",
        comments: "268",
        saves: "511",
    },
    {
        id: "post-lower",
        type: "post",
        title: "Lower body strength receipt",
        creator: "Maya Chen",
        handle: "maya.moves",
        metric: "18,420 lb",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=85",
        tags: ["legs", "strength", "squat", "cut"],
        height: "medium",
        tone: "pink",
        likes: "1.8k",
        comments: "142",
        saves: "244",
    },
    {
        id: "reel-run",
        type: "reel",
        title: "Waterfront intervals",
        creator: "Jordan Miles",
        handle: "runwithjo",
        metric: "5.2 km",
        image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=900&q=85",
        tags: ["running", "conditioning", "intervals", "zone 2"],
        height: "tall",
        tone: "green",
        likes: "980",
        comments: "74",
        saves: "126",
    },
    {
        id: "post-bulk",
        type: "post",
        title: "Heavy hinge day",
        creator: "Sam Patel",
        handle: "sam.bulks",
        metric: "Top + back-off",
        image: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=900&q=85",
        tags: ["deadlift", "posterior", "bulk", "strength"],
        height: "short",
        tone: "gold",
        likes: "2.4k",
        comments: "187",
        saves: "389",
    },
    {
        id: "reel-push",
        type: "reel",
        title: "Top set incline press",
        creator: "Nia Brooks",
        handle: "liftwithnia",
        metric: "2 RIR",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85",
        tags: ["push", "chest", "hypertrophy", "bench"],
        height: "tall",
        tone: "violet",
        likes: "4.1k",
        comments: "322",
        saves: "691",
    },
    {
        id: "post-mobility",
        type: "post",
        title: "Five-minute shoulder prep",
        creator: "Coach AI",
        handle: "brawn.coach",
        metric: "Warmup",
        image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=85",
        tags: ["mobility", "shoulders", "warmup", "prehab"],
        height: "medium",
        tone: "blue",
        likes: "1.1k",
        comments: "89",
        saves: "340",
    },
    {
        id: "post-meal",
        type: "post",
        title: "Bulk meal prep stack",
        creator: "Sam Patel",
        handle: "sam.bulks",
        metric: "3,200 cal",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85",
        tags: ["nutrition", "bulk", "meal prep", "protein"],
        height: "short",
        tone: "green",
        likes: "776",
        comments: "51",
        saves: "205",
    },
    {
        id: "reel-glute",
        type: "reel",
        title: "Glute bridge tempo cue",
        creator: "Maya Chen",
        handle: "maya.moves",
        metric: "3 sec hold",
        image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=85",
        tags: ["glutes", "legs", "tempo", "hypertrophy"],
        height: "tall",
        tone: "pink",
        likes: "2.9k",
        comments: "201",
        saves: "502",
    },
];

const normalize = (value) => (value || "").toString().trim().toLowerCase();

const matchesSearch = (item, query) => {
    if (!query) return true;
    const haystack = [
        item.title,
        item.creator,
        item.handle,
        item.metric,
        ...(item.tags || []),
    ].map(normalize).join(" ");

    return haystack.includes(query);
};

const getPostImage = (post) => {
    const photo = post.slides?.find((slide) => slide.type === "photo" && slide.src);
    return photo?.src || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85";
};

const getInitials = (name = "Athlete") =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

const Discover = () => {
    const { user } = useAuth();
    const { posts, repostPost, savedPostIds, toggleSavePost } = useSocialPosts();
    const [query, setQuery] = useState("");
    const [activeQuery, setActiveQuery] = useState("");
    const [recentSearches, setRecentSearches] = useState(readRecentSearches);
    const [isSearchFocused, setSearchFocused] = useState(false);

    useEffect(() => {
        writeRecentSearches(recentSearches);
    }, [recentSearches]);

    const socialItems = useMemo(() => posts.map((post, index) => ({
        id: `social-${post.id}`,
        postId: post.id,
        type: post.kind === "route" || post.kind === "challenge" ? "post" : post.kind || "post",
        title: post.caption || post.action,
        creator: post.name,
        handle: post.handle,
        metric: post.stat || post.tag,
        image: getPostImage(post),
        tags: [post.kind, post.tag, post.caption, post.detail, ...(post.tags || [])].filter(Boolean),
        height: index % 3 === 0 ? "tall" : index % 3 === 1 ? "medium" : "short",
        tone: post.tone || "green",
        likes: post.saves ? `${post.saves * 3}` : "42",
        comments: post.reposts ? `${post.reposts + 12}` : "12",
        saves: `${post.saves || 0}`,
        isSocialPost: true,
        sourcePost: post,
    })), [posts]);

    const discoverItems = useMemo(() => [...socialItems, ...seededDiscoverItems], [socialItems]);
    const searchText = normalize(activeQuery);

    const filteredProfiles = useMemo(() => {
        const matches = profileRecommendations.filter((profile) => matchesSearch({
            title: profile.name,
            creator: profile.specialty,
            handle: profile.handle,
            metric: profile.reason,
            tags: profile.tags,
        }, searchText));

        return matches.length ? matches : profileRecommendations.slice(0, 4);
    }, [searchText]);

    const filteredItems = useMemo(() => {
        const matches = discoverItems.filter((item) => matchesSearch(item, searchText));
        return matches.length ? matches : discoverItems;
    }, [discoverItems, searchText]);

    const suggestedSearches = useMemo(() => {
        const typed = normalize(query);
        const profileTerms = profileRecommendations.flatMap((profile) => [profile.name, profile.handle, profile.specialty]);
        const allSuggestions = [...topicSuggestions, ...profileTerms];

        return allSuggestions
            .filter((term, index, array) => array.indexOf(term) === index)
            .filter((term) => !typed || normalize(term).includes(typed))
            .slice(0, 6);
    }, [query]);

    const commitSearch = (value = query) => {
        const trimmed = value.trim();
        setActiveQuery(trimmed);
        setQuery(trimmed);

        if (trimmed) {
            setRecentSearches((currentSearches) => [
                trimmed,
                ...currentSearches.filter((search) => normalize(search) !== normalize(trimmed)),
            ].slice(0, 6));
        }
    };

    const chooseSearch = (value) => {
        commitSearch(value);
        setSearchFocused(false);
    };

    const clearSearch = () => {
        setQuery("");
        setActiveQuery("");
    };

    return (
        <div className="discover-page">
            <header className="discover-header">
                <form
                    className="discover-search-wrap"
                    onSubmit={(event) => {
                        event.preventDefault();
                        commitSearch();
                        setSearchFocused(false);
                    }}
                >
                    <label className="discover-search">
                        <Search className="h-5 w-5" />
                        <input
                            type="search"
                            placeholder="Search workouts, creators, reels"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            onFocus={() => setSearchFocused(true)}
                        />
                        {query && (
                            <button type="button" aria-label="Clear search" onClick={clearSearch}>
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </label>

                    {isSearchFocused && (
                        <div className="discover-search-popover" onMouseDown={(event) => event.preventDefault()}>
                            {recentSearches.length > 0 && (
                                <section>
                                    <div className="discover-popover-heading">
                                        <Clock className="h-4 w-4" />
                                        <span>Recent</span>
                                    </div>
                                    <div className="discover-search-chip-row">
                                        {recentSearches.map((search) => (
                                            <button key={search} type="button" onClick={() => chooseSearch(search)}>
                                                {search}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section>
                                <div className="discover-popover-heading">
                                    <Sparkles className="h-4 w-4" />
                                    <span>Suggested</span>
                                </div>
                                <div className="discover-suggestion-list">
                                    {suggestedSearches.map((suggestion) => (
                                        <button key={suggestion} type="button" onClick={() => chooseSearch(suggestion)}>
                                            <Search className="h-4 w-4" />
                                            <span>{suggestion}</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </form>
            </header>

            <section className="discover-mood-row" aria-label="Discover filters">
                {["For You", "Strength", "Hypertrophy", "Cardio", "Mobility", "Nutrition"].map((filter) => (
                    <button
                        key={filter}
                        type="button"
                        className={normalize(activeQuery || "For You") === normalize(filter) ? "active" : ""}
                        onClick={() => commitSearch(filter === "For You" ? "" : filter)}
                    >
                        {filter === "For You" ? <Sparkles className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
                        <span>{filter}</span>
                    </button>
                ))}
            </section>

            <section className="discover-profile-rail" aria-label="Recommended profiles">
                <div className="discover-section-heading">
                    <h2>{activeQuery ? `Profiles for "${activeQuery}"` : "Suggested for you"}</h2>
                </div>

                <div className="discover-profile-list">
                    {filteredProfiles.slice(0, 5).map((profile) => (
                        <article key={profile.id} className="discover-profile-card">
                            <Link
                                to={getProfileRoute(profile.handle, user) || "/discover"}
                                className="discover-profile-main-link"
                            >
                                <span className={`discover-avatar tone-${profile.tone}`}>{profile.initials}</span>
                            </Link>
                            <div className="discover-profile-copy">
                                <div>
                                    <Link to={getProfileRoute(profile.handle, user) || "/discover"}>
                                        {profile.name}
                                    </Link>
                                    {profile.verified && <BadgeCheck className="h-4 w-4" />}
                                </div>
                                <span>@{profile.handle}</span>
                                <p>{profile.specialty}</p>
                                <small>{profile.reason}</small>
                            </div>
                            <div className="discover-profile-meta">
                                <span>{profile.stats}</span>
                                <button type="button" aria-label={`Follow ${profile.name}`}>
                                    <UserPlus className="h-4 w-4" />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="discover-board-section">
                <div className="discover-section-heading">
                    <h2>{activeQuery ? `Results for "${activeQuery}"` : "Explore"}</h2>
                </div>

                <div className="discover-masonry" aria-label="Discover posts and reels">
                    {filteredItems.map((item) => {
                        const isSaved = item.postId ? savedPostIds.includes(item.postId) : false;
                        const isReel = item.type === "reel";

                        return (
                            <article key={item.id} className={`discover-tile discover-tile-${item.height} tone-${item.tone}`}>
                                <div className="discover-tile-media">
                                    <img src={item.image} alt={item.title} />
                                    <div className="discover-tile-gradient" aria-hidden="true" />
                                    <div className="discover-tile-type">
                                        {isReel ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                                        <span>{isReel ? "Reel" : "Post"}</span>
                                    </div>
                                    {isReel && (
                                        <button type="button" className="discover-play-button" aria-label={`Play ${item.title}`}>
                                            <Play className="h-6 w-6" fill="currentColor" />
                                        </button>
                                    )}
                                </div>

                                    <div className="discover-tile-body">
                                    <Link
                                        to={getProfileRoute(item.handle || item.creator, user) || "/discover"}
                                        className="discover-tile-author"
                                    >
                                        <span className={`discover-mini-avatar tone-${item.tone}`}>{getInitials(item.creator)}</span>
                                        <div>
                                            <strong>{item.creator}</strong>
                                            <small>@{item.handle}</small>
                                        </div>
                                    </Link>
                                    <h3>{item.title}</h3>
                                    <div className="discover-tile-tags">
                                        {(item.tags || []).slice(0, 3).map((tag) => (
                                            <button
                                                type="button"
                                                key={`${item.id}-${tag}`}
                                                onClick={() => commitSearch(tag.toString())}
                                            >
                                                #{tag.toString().replace(/\s+/g, "")}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="discover-tile-actions">
                                        <span><Heart className="h-4 w-4" /> {item.likes}</span>
                                        <span><MessageCircle className="h-4 w-4" /> {item.comments}</span>
                                        <button
                                            type="button"
                                            className={isSaved ? "is-saved" : ""}
                                            aria-label={isSaved ? "Remove saved post" : "Save post"}
                                            onClick={() => item.postId && toggleSavePost(item.postId)}
                                            disabled={!item.postId}
                                        >
                                            <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                                            {item.saves}
                                        </button>
                                        {item.sourcePost && (
                                            <button type="button" aria-label="Repost" onClick={() => repostPost(item.sourcePost)}>
                                                <Repeat2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default Discover;
