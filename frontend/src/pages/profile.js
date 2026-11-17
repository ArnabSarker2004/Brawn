import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Activity,
    ArrowLeft,
    AtSign,
    BadgeCheck,
    BarChart3,
    Bell,
    Bookmark,
    CalendarDays,
    Camera,
    ChevronRight,
    Clapperboard,
    Download,
    Dumbbell,
    Edit3,
    Eye,
    Flame,
    Grid3X3,
    HeartPulse,
    KeyRound,
    LineChart,
    Lock,
    LogOut,
    Mail,
    Repeat2,
    Ruler,
    Scale,
    Settings,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
    Smartphone,
    Target,
    Trash2,
    UserCog,
    UserRound,
    Users,
    Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Profile } from "../components/ui/profile";
import { useAuth } from "../context/AuthContext";
import { useSocialPosts } from "../context/SocialPostsContext";

const numberFrom = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const match = value.toString().replace(/,/g, "").match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : null;
};

const compactNumber = (value) => {
    const number = Number(value || 0);
    if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}k`;
    return `${number}`;
};

const getInitials = (name, fallback = "YA") => {
    const source = (name || fallback).trim();
    const initials = source
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
    return initials || "YA";
};

const normalizeGender = (value) => {
    const normalized = (value || "").toString().trim().toLowerCase();
    if (!normalized) return "";
    if (["item 1", "male", "man", "m"].includes(normalized)) return "Male";
    if (["item 2", "female", "woman", "f"].includes(normalized)) return "Female";
    return value.toString();
};

const inferWeightKg = (weight) => {
    if (!weight) return null;
    return weight > 140 ? weight * 0.453592 : weight;
};

const formatHeight = (heightCm) => {
    if (!heightCm) return { value: "Add height", detail: "Profile setup" };
    const totalInches = heightCm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches - feet * 12);
    return {
        value: `${Math.round(heightCm)} cm`,
        detail: `${feet}'${inches}"`,
    };
};

const formatWeight = (weight) => {
    if (!weight) return { value: "Add weight", detail: "Profile setup" };
    const isLikelyPounds = weight > 140;
    const kg = inferWeightKg(weight);
    return {
        value: `${Math.round(weight)} ${isLikelyPounds ? "lb" : "kg"}`,
        detail: isLikelyPounds ? `${Math.round(kg)} kg` : `${Math.round(kg * 2.20462)} lb`,
    };
};

const calculateBmr = ({ weightKg, heightCm, age, gender }) => {
    if (!weightKg || !heightCm || !age) return null;
    const genderLabel = normalizeGender(gender).toLowerCase();
    if (!["male", "female"].includes(genderLabel)) return null;
    const modifier = genderLabel === "female" ? -161 : 5;
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + modifier);
};

const formatMetric = (value, suffix = "") => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "Add data";
    return `${Math.round(Number(value)).toLocaleString()}${suffix}`;
};

const ProfilePage = () => {
    const URL =
        process.env.NODE_ENV === "production"
            ? "https://brawn-tedx.onrender.com"
            : "http://localhost:4000";

    const [error, setError] = useState(null);
    const [body, setBody] = useState(null);
    const [activeTab, setActiveTab] = useState("posts");
    const [activeSetupSection, setActiveSetupSection] = useState("edit");
    const [isSetupOpen, setIsSetupOpen] = useState(false);
    const [setupPreferences, setSetupPreferences] = useState({
        privateProfile: false,
        activityStatus: true,
        workoutVisibility: true,
        taggedApprovals: true,
        pushNotifications: true,
        workoutReminders: true,
        friendRequests: true,
        weeklyReports: true,
    });
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { posts, repostPost, savedPostIds, toggleSavePost, userPosts } = useSocialPosts();

    const updateUserDetails = async (updatedData) => {
        try {
            const response = await fetch(`${URL}/api/user/updatebody`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: user,
                    ...updatedData,
                }),
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok) {
                setError(null);
                setBody((currentBody) => ({ ...(currentBody || {}), ...updatedData }));
            } else {
                setError(data.error || "Failed to update user details");
            }
        } catch (err) {
            setError("An error occurred while updating user details");
        }
    };

    const getUserdata = useCallback(async () => {
        try {
            const response = await fetch(`${URL}/api/user/getbodyinfo`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: user,
                }),
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                setBody(data);
            }
        } catch {
            setError("No profile information found yet");
        }
    }, [URL, user]);

    useEffect(() => {
        if (user) getUserdata();
    }, [getUserdata, user]);

    const displayName = body?.Name || (user ? user.charAt(0).toUpperCase() + user.slice(1) : "Athlete");
    const handle = user || "you";
    const avatarInitials = getInitials(displayName, handle);

    const savedPosts = useMemo(
        () => posts.filter((post) => savedPostIds.includes(post.id)),
        [posts, savedPostIds]
    );

    const healthProfile = useMemo(() => {
        const heightCm = numberFrom(body?.Height);
        const weight = numberFrom(body?.Weight);
        const weightKg = inferWeightKg(weight);
        const age = numberFrom(body?.Age);
        const gender = normalizeGender(body?.Gender);
        const storedBmr = numberFrom(body?.BMR);
        const bmr = storedBmr || calculateBmr({ weightKg, heightCm, age, gender });
        const bmi = heightCm && weightKg ? weightKg / ((heightCm / 100) ** 2) : null;
        const maintenance = bmr ? Math.round(bmr * 1.45) : null;
        const proteinLow = weightKg ? Math.round(weightKg * 1.6) : null;
        const proteinHigh = weightKg ? Math.round(weightKg * 2.2) : null;
        const hydration = weightKg ? (weightKg * 0.033).toFixed(1) : null;
        const experience = numberFrom(body?.YearsOfWorkoutExperience);
        const filledFields = [
            body?.Name,
            body?.Email,
            body?.Height,
            body?.Weight,
            body?.Age,
            body?.Gender,
            bmr,
            body?.YearsOfWorkoutExperience,
            body?.Bio,
        ].filter((value) => value !== null && value !== undefined && value !== "").length;
        const completeness = Math.round((filledFields / 9) * 100);

        return {
            age,
            bmi,
            bmr,
            completeness,
            experience,
            gender,
            height: formatHeight(heightCm),
            heightCm,
            hydration,
            maintenance,
            proteinHigh,
            proteinLow,
            weight: formatWeight(weight),
            weightKg,
        };
    }, [body]);

    const profileStats = [
        { label: "posts", value: userPosts.length },
        { label: "workouts", value: body?.TotalWorkouts || 0 },
        { label: "streak", value: body?.CurrentWorkoutStreak || 0 },
        { label: "saved", value: savedPostIds.length },
    ];

    const bodyStats = [
        { label: "Height", value: healthProfile.height.value, detail: healthProfile.height.detail, icon: Ruler, tone: "blue" },
        { label: "Weight", value: healthProfile.weight.value, detail: healthProfile.weight.detail, icon: Scale, tone: "green" },
        { label: "Age", value: healthProfile.age ? `${Math.round(healthProfile.age)}` : "Add age", detail: "Years", icon: CalendarDays, tone: "gold" },
        { label: "Gender", value: healthProfile.gender || "Add gender", detail: "Profile", icon: UserRound, tone: "pink" },
    ];

    const healthInsights = [
        {
            label: "BMR",
            value: healthProfile.bmr ? `${formatMetric(healthProfile.bmr)} kcal` : "Add data",
            detail: "Resting burn",
            icon: HeartPulse,
            tone: "pink",
        },
        {
            label: "Maintenance",
            value: healthProfile.maintenance ? `${formatMetric(healthProfile.maintenance)} kcal` : "Add data",
            detail: "Estimated daily target",
            icon: Flame,
            tone: "orange",
        },
        {
            label: "BMI",
            value: healthProfile.bmi ? healthProfile.bmi.toFixed(1) : "Add data",
            detail: "Body mass index",
            icon: BarChart3,
            tone: "blue",
        },
        {
            label: "Protein",
            value: healthProfile.proteinLow ? `${healthProfile.proteinLow}-${healthProfile.proteinHigh} g` : "Add data",
            detail: "Daily training range",
            icon: Dumbbell,
            tone: "green",
        },
        {
            label: "Hydration",
            value: healthProfile.hydration ? `${healthProfile.hydration} L` : "Add data",
            detail: "Daily baseline",
            icon: Activity,
            tone: "cyan",
        },
        {
            label: "Training age",
            value: healthProfile.experience ? `${healthProfile.experience} yr` : "Add data",
            detail: "Workout experience",
            icon: LineChart,
            tone: "violet",
        },
    ];

    const highlights = [
        { label: "Body", value: healthProfile.weight.value, icon: Scale, tone: "green" },
        { label: "Macros", value: healthProfile.proteinLow ? `${healthProfile.proteinLow}g+` : "Soon", icon: Target, tone: "blue" },
        { label: "Burn", value: healthProfile.bmr ? `${formatMetric(healthProfile.bmr)}` : "BMR", icon: Flame, tone: "orange" },
        { label: "Recovery", value: "Sleep", icon: HeartPulse, tone: "pink" },
        { label: "PRs", value: `${compactNumber(body?.TotalWorkouts || 0)} logs`, icon: Zap, tone: "gold" },
        { label: "Circle", value: "Friends", icon: Users, tone: "violet" },
    ];

    const tabs = [
        { id: "posts", label: "Posts", icon: Grid3X3, count: userPosts.length },
        { id: "reels", label: "Reels", icon: Clapperboard, count: 0 },
        { id: "saved", label: "Saved", icon: Bookmark, count: savedPosts.length },
    ];

    const currentTabPosts = activeTab === "saved" ? savedPosts : activeTab === "posts" ? userPosts : [];

    const setupSections = [
        { id: "edit", label: "Edit profile", description: "Name, bio, photo, and body profile", icon: UserCog },
        { id: "account", label: "Account center", description: "Login, email, password, and devices", icon: AtSign },
        { id: "privacy", label: "Privacy", description: "Visibility, activity, tags, and sharing", icon: Lock },
        { id: "notifications", label: "Notifications", description: "Workout nudges, social alerts, and reports", icon: Bell },
        { id: "health", label: "Health data", description: "Body metrics, calorie math, and future insights", icon: HeartPulse },
        { id: "data", label: "Data controls", description: "Export, saved content, and account actions", icon: ShieldCheck },
    ];

    const handleOpenSetup = (section = "edit") => {
        setActiveSetupSection(section);
        setIsSetupOpen(true);

        if (typeof window !== "undefined") {
            window.requestAnimationFrame(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
    };

    const handleCloseSetup = () => {
        setIsSetupOpen(false);

        if (typeof window !== "undefined") {
            window.requestAnimationFrame(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
    };

    const togglePreference = (key) => {
        setSetupPreferences((currentPreferences) => ({
            ...currentPreferences,
            [key]: !currentPreferences[key],
        }));
    };

    const handleSignOut = () => {
        logout();
    };

    const renderPostGrid = () => {
        if (activeTab === "reels") {
            return (
                <div className="profile-empty-posts">
                    <Clapperboard className="h-8 w-8" />
                    <h3>No reels yet</h3>
                    <p>Share a training clip from the Reels page or create a post with a workout moment.</p>
                    <button type="button" onClick={() => navigate("/create")}>
                        <Camera className="h-4 w-4" />
                        Create clip
                    </button>
                </div>
            );
        }

        if (!currentTabPosts.length) {
            return (
                <div className="profile-empty-posts">
                    <Grid3X3 className="h-8 w-8" />
                    <h3>{activeTab === "saved" ? "No saved posts" : "No posts yet"}</h3>
                    <p>{activeTab === "saved" ? "Saved training posts and workout ideas will live here." : "Create your first training post from the composer."}</p>
                    <button type="button" onClick={() => navigate("/create")}>
                        <Camera className="h-4 w-4" />
                        Create post
                    </button>
                </div>
            );
        }

        return (
            <div className="profile-post-grid">
                {currentTabPosts.map((post) => {
                    const firstPhoto = post.slides?.find((slide) => slide.type === "photo");
                    const workoutSlide = post.slides?.find((slide) => slide.type === "workout");
                    const isSaved = savedPostIds.includes(post.id);

                    return (
                        <article key={post.id} className="profile-post-tile">
                            <div className="profile-post-media">
                                {firstPhoto ? (
                                    <img src={firstPhoto.src} alt={firstPhoto.alt || post.caption} style={firstPhoto.style || undefined} />
                                ) : (
                                    <Dumbbell className="h-9 w-9" />
                                )}
                                {(post.slides?.length || 1) > 1 && <span>{post.slides.length}</span>}
                                <div className="profile-post-overlay">
                                    <div>
                                        <strong>{workoutSlide?.title || post.tag || "Training post"}</strong>
                                        <p>{post.caption}</p>
                                    </div>
                                    <div className="profile-post-overlay-actions">
                                        <button type="button" onClick={() => toggleSavePost(post.id)}>
                                            <Bookmark className={`h-4 w-4 ${isSaved ? "saved" : ""}`} />
                                            {isSaved ? "Saved" : "Save"}
                                        </button>
                                        <button type="button" onClick={() => repostPost(post)}>
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

    const renderPreferenceRow = ({ id, icon: Icon, label, detail }) => {
        const enabled = setupPreferences[id];

        return (
            <article className="profile-preference-row" key={id}>
                <span><Icon className="h-4 w-4" /></span>
                <div>
                    <strong>{label}</strong>
                    <p>{detail}</p>
                </div>
                <button
                    type="button"
                    className={`profile-toggle ${enabled ? "is-on" : ""}`}
                    aria-pressed={enabled}
                    onClick={() => togglePreference(id)}
                >
                    <span />
                </button>
            </article>
        );
    };

    const renderSetupContent = () => {
        if (activeSetupSection === "account") {
            const accountRows = [
                { icon: Mail, label: "Email", value: body?.Email || "Add email address", action: "Manage" },
                { icon: KeyRound, label: "Password", value: "Last changed not available", action: "Update" },
                { icon: Smartphone, label: "Devices", value: "This browser session", action: "Review" },
                { icon: ShieldCheck, label: "Two-factor authentication", value: "Recommended for account safety", action: "Set up" },
            ];

            return (
                <div className="profile-setup-panel">
                    <div className="profile-setup-panel-header">
                        <span><AtSign className="h-5 w-5" /></span>
                        <div>
                            <p>Account center</p>
                            <h3>Login, identity, and connected access</h3>
                        </div>
                    </div>
                    <div className="profile-account-card">
                        <div className="profile-mini-avatar">{avatarInitials}</div>
                        <div>
                            <strong>{displayName}</strong>
                            <p>@{handle}</p>
                        </div>
                        <BadgeCheck className="h-5 w-5" />
                    </div>
                    <div className="profile-management-list">
                        {accountRows.map(({ icon: Icon, label, value, action }) => (
                            <article key={label}>
                                <span><Icon className="h-4 w-4" /></span>
                                <div>
                                    <strong>{label}</strong>
                                    <p>{value}</p>
                                </div>
                                <button type="button">
                                    {action}
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </article>
                        ))}
                    </div>
                </div>
            );
        }

        if (activeSetupSection === "privacy") {
            const privacyRows = [
                { id: "privateProfile", icon: Lock, label: "Private profile", detail: "Only approved followers can see posts, reels, and training updates." },
                { id: "activityStatus", icon: Eye, label: "Activity status", detail: "Let friends see when you were recently active in Brawn." },
                { id: "workoutVisibility", icon: Dumbbell, label: "Workout visibility", detail: "Allow workout summaries and routine receipts to appear on your profile." },
                { id: "taggedApprovals", icon: UserRound, label: "Approve tags manually", detail: "Review posts and challenges before they appear on your profile." },
            ];

            return (
                <div className="profile-setup-panel">
                    <div className="profile-setup-panel-header">
                        <span><Lock className="h-5 w-5" /></span>
                        <div>
                            <p>Privacy</p>
                            <h3>Visibility and sharing controls</h3>
                        </div>
                    </div>
                    <div className="profile-preference-list">
                        {privacyRows.map(renderPreferenceRow)}
                    </div>
                </div>
            );
        }

        if (activeSetupSection === "notifications") {
            const notificationRows = [
                { id: "pushNotifications", icon: Bell, label: "Push notifications", detail: "Receive social updates, check-ins, and milestone alerts." },
                { id: "workoutReminders", icon: CalendarDays, label: "Workout reminders", detail: "Get nudges for scheduled sessions and missed routine days." },
                { id: "friendRequests", icon: Users, label: "Friend requests", detail: "Know when training partners follow, tag, or invite you." },
                { id: "weeklyReports", icon: BarChart3, label: "Weekly reports", detail: "Summaries for volume, consistency, body metrics, and recovery trends." },
            ];

            return (
                <div className="profile-setup-panel">
                    <div className="profile-setup-panel-header">
                        <span><Bell className="h-5 w-5" /></span>
                        <div>
                            <p>Notifications</p>
                            <h3>Alerts that support training consistency</h3>
                        </div>
                    </div>
                    <div className="profile-preference-list">
                        {notificationRows.map(renderPreferenceRow)}
                    </div>
                </div>
            );
        }

        if (activeSetupSection === "health") {
            return (
                <div className="profile-setup-panel">
                    <div className="profile-setup-panel-header">
                        <span><HeartPulse className="h-5 w-5" /></span>
                        <div>
                            <p>Health data</p>
                            <h3>Body metrics and future personalization</h3>
                        </div>
                    </div>
                    <div className="profile-health-data-grid">
                        {healthInsights.map(({ icon: Icon, label, value, detail, tone }) => (
                            <article key={label} className={`tone-${tone}`}>
                                <span><Icon className="h-4 w-4" /></span>
                                <div>
                                    <strong>{value}</strong>
                                    <p>{label}</p>
                                    <small>{detail}</small>
                                </div>
                            </article>
                        ))}
                    </div>
                    <div className="profile-setup-note">
                        <Sparkles className="h-4 w-4" />
                        <p>These values can power future nutrition targets, recovery prompts, routine recommendations, and progress analytics.</p>
                    </div>
                </div>
            );
        }

        if (activeSetupSection === "data") {
            const dataRows = [
                { icon: Download, label: "Download your data", value: "Export profile, posts, saved items, and workout summaries.", action: "Request" },
                { icon: Bookmark, label: "Saved content", value: `${savedPostIds.length} saved training posts and ideas.`, action: "Review" },
                { icon: SlidersHorizontal, label: "Personalization", value: "Manage how profile and workout data shape recommendations.", action: "Manage" },
                { icon: LogOut, label: "Sign out", value: "End this session and return to the login page.", action: "Sign out", danger: true, onClick: handleSignOut },
                { icon: Trash2, label: "Deactivate or delete", value: "Review account removal and recovery options.", action: "Review", danger: true },
            ];

            return (
                <div className="profile-setup-panel">
                    <div className="profile-setup-panel-header">
                        <span><ShieldCheck className="h-5 w-5" /></span>
                        <div>
                            <p>Data controls</p>
                            <h3>Exports, personalization, and account actions</h3>
                        </div>
                    </div>
                    <div className="profile-management-list">
                        {dataRows.map(({ icon: Icon, label, value, action, danger, onClick }) => (
                            <article key={label} className={danger ? "is-danger" : ""}>
                                <span><Icon className="h-4 w-4" /></span>
                                <div>
                                    <strong>{label}</strong>
                                    <p>{value}</p>
                                </div>
                                <button type="button" onClick={onClick}>
                                    {action}
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </article>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="profile-setup-panel">
                <div className="profile-setup-panel-header">
                    <span><UserCog className="h-5 w-5" /></span>
                    <div>
                        <p>Edit profile</p>
                        <h3>Public profile and body setup</h3>
                    </div>
                </div>
                <div className="profile-account-card">
                    <div className="profile-mini-avatar">{avatarInitials}</div>
                    <div>
                        <strong>{displayName}</strong>
                        <p>@{handle} - {healthProfile.completeness}% setup complete</p>
                    </div>
                    <button type="button" onClick={() => navigate("/create")}>
                        <Camera className="h-4 w-4" />
                        Create
                    </button>
                </div>
                <Profile error={error} data={body} onSave={updateUserDetails} />
            </div>
        );
    };

    const renderSetupPage = () => (
        <>
            <section className="profile-setup-topbar">
                <button type="button" onClick={handleCloseSetup}>
                    <ArrowLeft className="h-4 w-4" />
                    Profile
                </button>
                <div>
                    <p>Settings and activity</p>
                    <h1>Account setup</h1>
                </div>
                <span className="profile-setup-topbar-icon">
                    <Settings className="h-5 w-5" />
                </span>
            </section>

            <section id="profile-setup" className="profile-setup-page profile-setup-page-active">
                <aside className="profile-setup-sidebar">
                    <div className="profile-setup-sidebar-header">
                        <p>Settings and activity</p>
                        <h2>Profile setup</h2>
                    </div>
                    <nav aria-label="Profile setup sections">
                        {setupSections.map(({ id, label, description, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                className={activeSetupSection === id ? "active" : ""}
                                onClick={() => setActiveSetupSection(id)}
                            >
                                <span><Icon className="h-4 w-4" /></span>
                                <div>
                                    <strong>{label}</strong>
                                    <p>{description}</p>
                                </div>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        ))}
                    </nav>
                </aside>

                <div className="profile-setup-content">
                    {renderSetupContent()}
                </div>
            </section>
        </>
    );

    return (
        <div className={`profile-social-page${isSetupOpen ? " profile-social-page-setup" : ""}`}>
            {isSetupOpen ? renderSetupPage() : (
                <>
                    <section className="profile-social-header">
                <div className="profile-social-avatar-wrap">
                    <div className="profile-social-avatar">
                        <span>{avatarInitials}</span>
                    </div>
                </div>

                <div className="profile-social-summary">
                    <div className="profile-social-topline">
                        <div className="profile-identity">
                            <p>@{handle}</p>
                            <h1>
                                {displayName}
                                <BadgeCheck className="h-5 w-5" />
                            </h1>
                        </div>
                        <div className="profile-header-actions">
                            <button type="button" onClick={() => navigate("/create")}>
                                <Camera className="h-4 w-4" />
                                Create
                            </button>
                            <button type="button" className="profile-secondary-action" onClick={() => handleOpenSetup("edit")}>
                                <Edit3 className="h-4 w-4" />
                                Edit profile
                            </button>
                            <button
                                type="button"
                                className="profile-icon-action"
                                aria-label="Profile settings"
                                title="Profile settings"
                                onClick={() => handleOpenSetup("account")}
                            >
                                <Settings className="h-4 w-4" />
                            </button>
                            <button type="button" className="profile-signout-action" onClick={handleSignOut}>
                                <LogOut className="h-4 w-4" />
                                Sign out
                            </button>
                        </div>
                    </div>

                    <div className="profile-social-stats">
                        {profileStats.map((stat) => (
                            <span key={stat.label}>
                                <strong>{compactNumber(stat.value)}</strong>
                                {stat.label}
                            </span>
                        ))}
                    </div>

                    <div className="profile-social-bio">
                        <strong>{body?.Bio ? "Bio" : "Training profile"}</strong>
                        <p>{body?.Bio || "Training updates, workout receipts, health metrics, and progress stories live here."}</p>
                        <div className="profile-bio-chips">
                            <span><Dumbbell className="h-3.5 w-3.5" /> {healthProfile.experience ? `${healthProfile.experience} yr lifting` : "Training setup"}</span>
                            <span><Sparkles className="h-3.5 w-3.5" /> {healthProfile.completeness}% complete</span>
                            <span><HeartPulse className="h-3.5 w-3.5" /> Health profile</span>
                        </div>
                    </div>
                </div>
                    </section>

                    <section className="profile-highlight-rail" aria-label="Profile highlights">
                {highlights.map(({ icon: Icon, label, value, tone }) => (
                    <article key={label} className={`profile-highlight-item tone-${tone}`}>
                        <span><Icon className="h-5 w-5" /></span>
                        <strong>{label}</strong>
                        <p>{value}</p>
                    </article>
                ))}
                    </section>

                    <section className="profile-health-panel">
                <div className="profile-section-title">
                    <div>
                        <p>Health profile</p>
                        <h2>Body, fueling, and readiness</h2>
                    </div>
                    <HeartPulse className="h-5 w-5" />
                </div>

                <div className="profile-health-layout">
                    <div className="profile-body-grid">
                        {bodyStats.map(({ icon: Icon, label, value, detail, tone }) => (
                            <article key={label} className={`profile-body-stat tone-${tone}`}>
                                <Icon className="h-5 w-5" />
                                <div>
                                    <span>{label}</span>
                                    <strong>{value}</strong>
                                    <p>{detail}</p>
                                </div>
                            </article>
                        ))}
                    </div>

                    <article className="profile-readiness-card">
                        <div>
                            <p>Setup score</p>
                            <strong>{healthProfile.completeness}%</strong>
                        </div>
                        <div className="profile-readiness-meter">
                            <span style={{ width: `${healthProfile.completeness}%` }} />
                        </div>
                        <small>Better profile data unlocks cleaner calorie, recovery, routine, and challenge recommendations.</small>
                    </article>
                </div>

                <div className="profile-insight-grid">
                    {healthInsights.map(({ icon: Icon, label, value, detail, tone }) => (
                        <article key={label} className={`profile-insight-card tone-${tone}`}>
                            <div>
                                <span><Icon className="h-4 w-4" /></span>
                                <p>{label}</p>
                            </div>
                            <strong>{value}</strong>
                            <small>{detail}</small>
                        </article>
                    ))}
                </div>
                    </section>

                    <section className="profile-posts-section">
                <div className="profile-content-tabs" role="tablist" aria-label="Profile content">
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

                {renderPostGrid()}
                    </section>
                </>
            )}
        </div>
    );
};

export default ProfilePage;
