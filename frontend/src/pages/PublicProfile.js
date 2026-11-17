import {
    ArrowLeft,
    BadgeCheck,
    Bookmark,
    Camera,
    ChevronLeft,
    ChevronRight,
    Dumbbell,
    Grid3X3,
    Heart,
    MessageCircle,
    Repeat2,
    Send,
    Tags,
    UserPlus,
    Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocialPosts } from "../context/SocialPostsContext";
import {
    PUBLIC_PROFILE_POSTS,
    PUBLIC_PROFILE_REPOSTS,
    PUBLIC_PROFILE_STORIES,
    getInitials,
    getProfileRoute,
    makeFallbackProfile,
    normalizeProfileHandle,
    profileMatchesValue,
    resolveSocialProfile,
} from "../utils/socialProfiles";

const compactNumber = (value) => {
    const number = Number(value || 0);
    if (number >= 1000000) return `${(number / 1000000).toFixed(number >= 10000000 ? 0 : 1)}m`;
    if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}k`;
    return `${number}`;
};

const uniquePosts = (posts) => {
    const postMap = new Map();
    posts.forEach((post) => {
        if (post?.id && !postMap.has(post.id)) postMap.set(post.id, post);
    });
    return Array.from(postMap.values());
};

const getPostMedia = (post) =>
    post.slides?.find((slide) => ["photo", "video"].includes(slide.type) && slide.src) ||
    post.slides?.find((slide) => slide.type === "workout") ||
    null;

const PublicProfile = () => {
    const { handle: routeHandle } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        posts,
        userPosts,
        userStories,
        savedPostIds,
        repostPost,
        toggleSavePost,
        sendSocialItem,
    } = useSocialPosts();
    const [activeTab, setActiveTab] = useState("posts");
    const [activeStoryIndex, setActiveStoryIndex] = useState(null);
    const [relationshipModal, setRelationshipModal] = useState(null);

    const normalizedRouteHandle = normalizeProfileHandle(routeHandle);
    const normalizedCurrentUser = normalizeProfileHandle(user);
    const isCurrentUserProfile =
        Boolean(normalizedCurrentUser && normalizedRouteHandle === normalizedCurrentUser) ||
        ["you", "today"].includes(normalizedRouteHandle);
    const directoryProfile = resolveSocialProfile(routeHandle);
    const profile = useMemo(() => {
        if (directoryProfile) return directoryProfile;
        if (isCurrentUserProfile) {
            const displayName = user ? user.charAt(0).toUpperCase() + user.slice(1) : "You";
            return {
                id: normalizedCurrentUser || "you",
                name: displayName,
                handle: normalizedCurrentUser || "you",
                aliases: ["you", displayName],
                initials: getInitials(displayName),
                verified: false,
                tone: "green",
                bio: "Your training posts, reposts, tags, stories, and social graph.",
                location: "Brawn",
                focus: "Training",
                followers: ["maya.moves", "runwithjo", "sam.bulks"],
                following: ["maya.moves", "brawn.coach"],
            };
        }
        return makeFallbackProfile(routeHandle);
    }, [directoryProfile, isCurrentUserProfile, normalizedCurrentUser, routeHandle, user]);

    const allPosts = useMemo(() => uniquePosts([...posts, ...PUBLIC_PROFILE_POSTS]), [posts]);
    const postById = useMemo(() => new Map(allPosts.map((post) => [post.id, post])), [allPosts]);

    const authoredPosts = useMemo(() => {
        const sourcePosts = isCurrentUserProfile ? userPosts : allPosts;
        return sourcePosts.filter((post) =>
            profileMatchesValue(profile, post.handle) ||
            profileMatchesValue(profile, post.name)
        );
    }, [allPosts, isCurrentUserProfile, profile, userPosts]);

    const repostedPosts = useMemo(() => {
        const publicReposts = PUBLIC_PROFILE_REPOSTS
            .filter((repost) => profileMatchesValue(profile, repost.profileHandle))
            .map((repost) => {
                const post = postById.get(repost.postId);
                return post
                    ? {
                          ...post,
                          id: `${profile.handle}-repost-${post.id}`,
                          displayPostId: post.id,
                          sourcePost: post,
                          repostedBy: profile.name,
                          repostedAt: repost.repostedAt,
                      }
                    : null;
            })
            .filter(Boolean);

        const ownReposts = isCurrentUserProfile
            ? userPosts
                  .filter((post) => post.repostSourceId || post.repostedFrom)
                  .map((post) => ({ ...post, sourcePost: post }))
            : [];

        return uniquePosts([...ownReposts, ...publicReposts]);
    }, [isCurrentUserProfile, postById, profile, userPosts]);

    const taggedPosts = useMemo(
        () =>
            allPosts.filter((post) =>
                (post.tags || []).some((tag) => profileMatchesValue(profile, tag))
            ),
        [allPosts, profile]
    );

    const stories = useMemo(() => {
        if (isCurrentUserProfile) {
            return userStories.map((story) => ({
                ...story,
                profileHandle: profile.handle,
                name: profile.name,
                metric: "Now",
                detail: story.caption || "Training check-in",
                tone: story.tone || profile.tone,
            }));
        }

        return PUBLIC_PROFILE_STORIES
            .filter((story) => profileMatchesValue(profile, story.profileHandle))
            .map((story) => ({
                ...story,
                name: profile.name,
                tone: story.tone || profile.tone,
            }));
    }, [isCurrentUserProfile, profile, userStories]);

    const tabs = [
        { id: "posts", label: "Posts", icon: Grid3X3, count: authoredPosts.length },
        { id: "reposts", label: "Reposts", icon: Repeat2, count: repostedPosts.length },
        { id: "tagged", label: "Tagged", icon: Tags, count: taggedPosts.length },
    ];

    const visiblePosts =
        activeTab === "reposts"
            ? repostedPosts
            : activeTab === "tagged"
              ? taggedPosts
              : authoredPosts;

    const relationshipProfiles = (profile[relationshipModal] || []).map((person) =>
        resolveSocialProfile(person) || makeFallbackProfile(person)
    );

    const activeStory = activeStoryIndex === null ? null : stories[activeStoryIndex];
    const followersCount = profile.followers?.length || 0;
    const followingCount = profile.following?.length || 0;

    const openStoryAt = (index) => setActiveStoryIndex(index);
    const moveStory = (direction) => {
        if (!stories.length || activeStoryIndex === null) return;
        setActiveStoryIndex((activeStoryIndex + direction + stories.length) % stories.length);
    };

    const sendProfile = () => {
        sendSocialItem({
            threadId: "maya",
            itemId: profile.handle,
            itemType: "profile",
            title: `${profile.name}'s profile`,
            preview: profile.bio,
            url: `${window.location.origin}/profile/${encodeURIComponent(profile.handle)}`,
        });
    };

    const renderPosts = () => {
        if (!visiblePosts.length) {
            return (
                <div className="profile-empty-posts public-profile-empty">
                    <Grid3X3 className="h-8 w-8" />
                    <h3>
                        {activeTab === "reposts"
                            ? "No reposts yet"
                            : activeTab === "tagged"
                              ? "No tagged posts yet"
                              : "No posts yet"}
                    </h3>
                    <p>
                        {activeTab === "tagged"
                            ? `Posts that tag ${profile.name} will appear here.`
                            : `${profile.name}'s training content will appear here.`}
                    </p>
                </div>
            );
        }

        return (
            <div className="profile-post-grid public-profile-grid">
                {visiblePosts.map((post) => {
                    const sourcePost = post.sourcePost || post;
                    const media = getPostMedia(sourcePost);
                    const isSaved = savedPostIds.includes(sourcePost.id);
                    const commentCount = (sourcePost.comments || []).length;

                    return (
                        <article key={`${activeTab}-${post.id}`} className="profile-post-tile public-profile-post-tile">
                            <div className="profile-post-media">
                                {media?.type === "video" ? (
                                    <video src={media.src} muted playsInline />
                                ) : media?.type === "photo" ? (
                                    <img src={media.src} alt={media.alt || sourcePost.caption} style={media.style || undefined} />
                                ) : (
                                    <Dumbbell className="h-9 w-9" />
                                )}
                                {(sourcePost.slides?.length || 1) > 1 && <span>{sourcePost.slides.length}</span>}
                                {post.repostedBy && (
                                    <em className="public-profile-repost-badge">
                                        <Repeat2 className="h-3.5 w-3.5" />
                                        Repost
                                    </em>
                                )}
                                <div className="profile-post-overlay">
                                    <div>
                                        <strong>{sourcePost.tag || sourcePost.kind || "Training post"}</strong>
                                        <p>{sourcePost.caption}</p>
                                        <small>
                                            <Heart className="h-3.5 w-3.5" />
                                            {compactNumber(sourcePost.likes || 0)}
                                            <MessageCircle className="h-3.5 w-3.5" />
                                            {compactNumber(commentCount)}
                                        </small>
                                    </div>
                                    <div className="profile-post-overlay-actions">
                                        <button type="button" onClick={() => toggleSavePost(sourcePost.id)}>
                                            <Bookmark className={`h-4 w-4 ${isSaved ? "saved" : ""}`} />
                                            {isSaved ? "Saved" : "Save"}
                                        </button>
                                        <button type="button" onClick={() => repostPost(sourcePost)}>
                                            <Repeat2 className="h-4 w-4" />
                                            Repost
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="profile-social-page public-profile-page">
            <section className="profile-social-header public-profile-header">
                <div className="profile-social-avatar-wrap">
                    <div className="profile-social-avatar">
                        <span>{profile.initials || getInitials(profile.name)}</span>
                    </div>
                </div>

                <div className="profile-social-summary">
                    <button type="button" className="public-profile-back" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>

                    <div className="profile-social-topline">
                        <div className="profile-identity">
                            <p>@{profile.handle}</p>
                            <h1>
                                {profile.name}
                                {profile.verified && <BadgeCheck className="h-5 w-5" />}
                            </h1>
                        </div>
                        <div className="profile-header-actions">
                            {isCurrentUserProfile ? (
                                <Link to="/profile" className="public-profile-action-link">
                                    <Camera className="h-4 w-4" />
                                    Edit profile
                                </Link>
                            ) : (
                                <>
                                    <button type="button">
                                        <UserPlus className="h-4 w-4" />
                                        Follow
                                    </button>
                                    <Link to={`/messages?thread=${profile.id}`} className="public-profile-action-link">
                                        <Send className="h-4 w-4" />
                                        Message
                                    </Link>
                                </>
                            )}
                            <button type="button" className="profile-secondary-action" onClick={sendProfile}>
                                <Send className="h-4 w-4" />
                                Send profile
                            </button>
                        </div>
                    </div>

                    <div className="profile-social-stats public-profile-stats">
                        <span>
                            <strong>{compactNumber(authoredPosts.length)}</strong>
                            posts
                        </span>
                        <button type="button" onClick={() => setRelationshipModal("followers")}>
                            <strong>{compactNumber(followersCount)}</strong>
                            followers
                        </button>
                        <button type="button" onClick={() => setRelationshipModal("following")}>
                            <strong>{compactNumber(followingCount)}</strong>
                            following
                        </button>
                        <span>
                            <strong>{compactNumber(repostedPosts.length)}</strong>
                            reposts
                        </span>
                    </div>

                    <div className="profile-social-bio">
                        <strong>{profile.focus}</strong>
                        <p>{profile.bio}</p>
                        <div className="profile-bio-chips">
                            <span><Users className="h-3.5 w-3.5" /> {followersCount} followers</span>
                            <span><Grid3X3 className="h-3.5 w-3.5" /> {authoredPosts.length} posts</span>
                            <span><Camera className="h-3.5 w-3.5" /> {stories.length} stories</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="profile-highlight-rail public-profile-story-rail" aria-label={`${profile.name}'s stories`}>
                {stories.length ? (
                    stories.map((story, index) => (
                        <button
                            key={story.id}
                            type="button"
                            className={`profile-highlight-item tone-${story.tone || profile.tone}`}
                            onClick={() => openStoryAt(index)}
                        >
                            <span><Camera className="h-5 w-5" /></span>
                            <strong>{story.detail || "Story"}</strong>
                            <p>{story.metric || "Now"}</p>
                        </button>
                    ))
                ) : (
                    <article className="profile-highlight-item tone-green public-profile-no-story">
                        <span><Camera className="h-5 w-5" /></span>
                        <strong>No stories</strong>
                        <p>Yet</p>
                    </article>
                )}
            </section>

            <section className="profile-posts-section public-profile-posts">
                <div className="profile-content-tabs" role="tablist" aria-label="Public profile content">
                    {tabs.map(({ id, label, icon: Icon, count }) => (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === id}
                            className={activeTab === id ? "active" : ""}
                            onClick={() => setActiveTab(id)}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                            <span>{compactNumber(count)}</span>
                        </button>
                    ))}
                </div>

                {renderPosts()}
            </section>

            {relationshipModal && (
                <div className="public-profile-modal-backdrop" role="presentation" onMouseDown={() => setRelationshipModal(null)}>
                    <section
                        className="public-profile-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${profile.name}'s ${relationshipModal}`}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <header>
                            <div>
                                <p>@{profile.handle}</p>
                                <h2>{relationshipModal === "followers" ? "Followers" : "Following"}</h2>
                            </div>
                            <button type="button" onClick={() => setRelationshipModal(null)} aria-label="Close relationship list">
                                ×
                            </button>
                        </header>
                        <div className="public-profile-list">
                            {relationshipProfiles.length ? (
                                relationshipProfiles.map((person) => {
                                    const route = getProfileRoute(person.handle, user);
                                    return (
                                        <Link
                                            key={`${relationshipModal}-${person.handle}`}
                                            to={route || "/discover"}
                                            onClick={() => setRelationshipModal(null)}
                                        >
                                            <span className={`public-profile-list-avatar tone-${person.tone}`}>{person.initials}</span>
                                            <span>
                                                <strong>{person.name}</strong>
                                                <small>@{person.handle}</small>
                                            </span>
                                            {person.verified && <BadgeCheck className="h-4 w-4" />}
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="public-profile-list-empty">
                                    <Users className="h-5 w-5" />
                                    <p>No {relationshipModal} to show yet.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {activeStory && (
                <div className="public-profile-story-backdrop" role="presentation" onMouseDown={() => setActiveStoryIndex(null)}>
                    <section
                        className={`public-profile-story-viewer tone-${activeStory.tone || profile.tone}`}
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${profile.name}'s story`}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <header>
                            <span>{profile.initials || getInitials(profile.name)}</span>
                            <div>
                                <strong>{profile.name}</strong>
                                <small>{activeStory.metric || "Now"} · {activeStory.detail || "Story"}</small>
                            </div>
                            <button type="button" onClick={() => setActiveStoryIndex(null)} aria-label="Close story">×</button>
                        </header>
                        <div className="public-profile-story-media">
                            {activeStory.type === "video" ? (
                                <video src={activeStory.src} controls autoPlay muted playsInline />
                            ) : (
                                <img src={activeStory.src} alt={activeStory.caption || `${profile.name}'s story`} />
                            )}
                            {stories.length > 1 && (
                                <>
                                    <button type="button" className="previous" onClick={() => moveStory(-1)} aria-label="Previous story">
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <button type="button" className="next" onClick={() => moveStory(1)} aria-label="Next story">
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </>
                            )}
                        </div>
                        <footer>{activeStory.caption || activeStory.detail}</footer>
                    </section>
                </div>
            )}
        </div>
    );
};

export default PublicProfile;
