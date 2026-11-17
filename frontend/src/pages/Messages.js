import {
    ArrowLeft,
    Bell,
    BellOff,
    Check,
    Copy,
    Dumbbell,
    FileText,
    Flame,
    ImagePlus,
    Info,
    Mail,
    MessageCircle,
    Mic,
    MicOff,
    MoreHorizontal,
    Phone,
    PhoneOff,
    Search,
    Send,
    ShieldCheck,
    Smile,
    Trash2,
    Trophy,
    UserPlus,
    Users,
    Video,
    VideoOff,
    X,
    Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocialPosts } from "../context/SocialPostsContext";
import { getProfileRoute } from "../utils/socialProfiles";

const getInitials = (name = "Athlete") =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

const seedThreads = [
    {
        id: "cut-30",
        name: "Cut 30 lb GC",
        handle: "challenge.cut30",
        status: "6 friends / challenge group",
        time: "2m",
        unread: 7,
        tone: "pink",
        goal: "Weight lost",
        streak: 9,
        preview: "Friday check-in thread is open.",
        messages: [
            { id: "cut-1", from: "them", body: "Friday check-in thread is open.", time: "2m" },
            { id: "cut-2", from: "me", body: "Logged lift and weigh-in. Staying boring.", time: "Now" },
            { id: "cut-3", from: "them", body: "Guardrail saved me from doing nonsense today.", time: "Now" },
        ],
    },
    {
        id: "gain-30",
        name: "Gain 30 lb GC",
        handle: "challenge.gain30",
        status: "4 friends / challenge group",
        time: "12m",
        unread: 3,
        tone: "gold",
        goal: "Lean gain score",
        streak: 12,
        preview: "Volume Crown carryover is real.",
        messages: [
            { id: "gain-1", from: "them", body: "Volume Crown carryover is real.", time: "12m" },
            { id: "gain-2", from: "me", body: "Adding calories slowly. No dirty bulk chaos.", time: "10m" },
            { id: "gain-3", from: "them", body: "PR post going up after push day.", time: "8m" },
        ],
    },
    {
        id: "step-sprint",
        name: "24h Step Sprint",
        handle: "challenge.steps",
        status: "5 friends / challenge group",
        time: "4m",
        unread: 14,
        tone: "blue",
        goal: "Total steps",
        streak: 1,
        preview: "Last hour push at 9?",
        messages: [
            { id: "step-1", from: "them", body: "Mall walk counts. No shame, all steps.", time: "14m" },
            { id: "step-2", from: "me", body: "Taking the long route after dinner.", time: "9m" },
            { id: "step-3", from: "them", body: "Last hour push at 9?", time: "4m" },
        ],
    },
    {
        id: "calorie-lock",
        name: "Calorie Lock",
        handle: "challenge.calories",
        status: "4 friends / challenge group",
        time: "18m",
        unread: 5,
        tone: "green",
        goal: "Compliant days",
        streak: 6,
        preview: "Protein target saved me today.",
        messages: [
            { id: "cal-1", from: "them", body: "Protein target saved me today.", time: "18m" },
            { id: "cal-2", from: "them", body: "Posting dinner before I forget.", time: "15m" },
            { id: "cal-3", from: "me", body: "Need a late snack that does not wreck this.", time: "11m" },
        ],
    },
    {
        id: "volume-crown",
        name: "Volume Crown",
        handle: "challenge.volume",
        status: "6 friends / challenge group",
        time: "25m",
        unread: 9,
        tone: "gold",
        goal: "Weekly tonnage",
        streak: 4,
        preview: "Saving back day for the comeback.",
        messages: [
            { id: "vol-1", from: "them", body: "Squats were a financial decision.", time: "25m" },
            { id: "vol-2", from: "me", body: "Saving back day for the comeback.", time: "20m" },
            { id: "vol-3", from: "them", body: "No junk volume court is in session.", time: "16m" },
        ],
    },
    {
        id: "zone2-bank",
        name: "Zone 2 Bank",
        handle: "challenge.zone2",
        status: "4 friends / challenge group",
        time: "32m",
        unread: 2,
        tone: "blue",
        goal: "Zone 2 minutes",
        streak: 2,
        preview: "Podcast pace locked in.",
        messages: [
            { id: "zone-1", from: "them", body: "Zone 2 is just patience with sneakers.", time: "32m" },
            { id: "zone-2", from: "me", body: "Podcast pace locked in.", time: "26m" },
            { id: "zone-3", from: "them", body: "Keeping ego out of the heart rate.", time: "20m" },
        ],
    },
    {
        id: "maya",
        name: "Maya Chen",
        handle: "maya.moves",
        status: "Active now",
        time: "2m",
        unread: 2,
        tone: "pink",
        goal: "Cut 30 lb squad",
        streak: 9,
        preview: "Want to join the 30 lb cut squad?",
        messages: [
            { id: "m1", from: "them", body: "Leg day is done. I am not negotiating with stairs today.", time: "9:14 AM" },
            { id: "m2", from: "me", body: "Post the story. The streak court needs proof.", time: "9:16 AM" },
            { id: "m3", from: "them", body: "Want to join the 30 lb cut squad? I can invite Jordan and Sam too.", time: "9:18 AM" },
        ],
    },
    {
        id: "coach",
        name: "Coach AI",
        handle: "brawn.coach",
        status: "Ready",
        time: "18m",
        unread: 0,
        tone: "green",
        goal: "Recovery cues",
        streak: 4,
        preview: "Your next lift could use more rest.",
        messages: [
            { id: "c1", from: "them", body: "Your last heavy set moved slower than usual.", time: "8:22 AM" },
            { id: "c2", from: "them", body: "Try 90 seconds before the next top set and keep the warmup lighter.", time: "8:23 AM" },
            { id: "c3", from: "me", body: "Save that cue for push day.", time: "8:31 AM" },
        ],
    },
    {
        id: "jordan",
        name: "Jordan Miles",
        handle: "runwithjo",
        status: "After workout",
        time: "1h",
        unread: 1,
        tone: "blue",
        goal: "10 day streak race",
        streak: 7,
        preview: "Race to 10 streak days?",
        messages: [
            { id: "j1", from: "them", body: "Race to 10 streak days?", time: "Yesterday" },
            { id: "j2", from: "me", body: "Winner chooses the Saturday route.", time: "Yesterday" },
            { id: "j3", from: "them", body: "Deal. No skipping mobility and calling it a workout.", time: "1h" },
        ],
    },
    {
        id: "sam",
        name: "Sam Patel",
        handle: "sam.bulks",
        status: "Lifting later",
        time: "3h",
        unread: 0,
        tone: "gold",
        goal: "Gain 30 lb ladder",
        streak: 12,
        preview: "Bulking ladder starts Monday.",
        messages: [
            { id: "s1", from: "them", body: "Bulking ladder starts Monday. Gain 30 lb, weekly check-ins, no dirty math.", time: "3h" },
            { id: "s2", from: "me", body: "Add me. I want the leaderboard visible on the home page.", time: "3h" },
        ],
    },
];

const quickReplies = ["Send weigh-in", "Drop workout", "Start challenge", "Share story"];
const quickEmojis = ["💪", "🔥", "👏", "❤️", "😂", "🏆", "✅", "👀"];
const MESSAGE_THREADS_KEY = "brawn-message-threads";

const isChallengeThread = (thread) => thread.handle?.startsWith("challenge.");

const readStoredThreads = () => {
    if (typeof window === "undefined") return seedThreads;

    try {
        const storedThreads = JSON.parse(window.localStorage.getItem(MESSAGE_THREADS_KEY) || "null");
        return Array.isArray(storedThreads) && storedThreads.length ? storedThreads : seedThreads;
    } catch {
        return seedThreads;
    }
};

const readMessageFile = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
            resolve({
                name: file.name,
                size: file.size,
                type: file.type || "application/octet-stream",
                src: reader.result,
            });
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const formatFileSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Messages = () => {
    const { user } = useAuth();
    const { sentItems } = useSocialPosts();
    const [searchParams] = useSearchParams();
    const [threads, setThreads] = useState(readStoredThreads);
    const [activeInboxTab, setActiveInboxTab] = useState("individuals");
    const [activeId, setActiveId] = useState(seedThreads.find((thread) => !isChallengeThread(thread))?.id || seedThreads[0].id);
    const [draft, setDraft] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [pendingAttachment, setPendingAttachment] = useState(null);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
    const [newConversation, setNewConversation] = useState({ name: "", handle: "", type: "individual" });
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isThreadMenuOpen, setIsThreadMenuOpen] = useState(false);
    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
    const [activeCall, setActiveCall] = useState(null);
    const [isCallMuted, setIsCallMuted] = useState(false);
    const [isCallVideoEnabled, setIsCallVideoEnabled] = useState(true);
    const [toast, setToast] = useState("");
    const composerRef = useRef(null);
    const fileInputRef = useRef(null);
    const chatBodyRef = useRef(null);
    const capitalizedName = user ? user.charAt(0).toUpperCase() + user.slice(1) : "You";
    const challengeThreads = useMemo(() => threads.filter(isChallengeThread), [threads]);
    const individualThreads = useMemo(() => threads.filter((thread) => !isChallengeThread(thread)), [threads]);
    const tabThreads = activeInboxTab === "challenges" ? challengeThreads : individualThreads;
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const visibleThreads = useMemo(
        () =>
            normalizedSearchQuery
                ? tabThreads.filter((thread) =>
                      [
                          thread.name,
                          thread.handle,
                          thread.preview,
                          thread.goal,
                          ...thread.messages.map((message) => message.body),
                      ]
                          .filter(Boolean)
                          .some((value) => value.toLowerCase().includes(normalizedSearchQuery))
                  )
                : tabThreads,
        [normalizedSearchQuery, tabThreads]
    );
    const activeThread = useMemo(
        () => threads.find((thread) => thread.id === activeId) || tabThreads[0] || threads[0],
        [activeId, tabThreads, threads]
    );
    const totalUnread = threads.reduce((total, thread) => total + (thread.unread || 0), 0);
    const sharedMediaCount = activeThread.messages.filter((message) => message.attachment || message.url).length;
    const inboxTabs = [
        {
            id: "individuals",
            label: "Individuals",
            count: individualThreads.length,
            unread: individualThreads.reduce((total, thread) => total + thread.unread, 0),
        },
        {
            id: "challenges",
            label: "Challenges",
            count: challengeThreads.length,
            unread: challengeThreads.reduce((total, thread) => total + thread.unread, 0),
        },
    ];

    useEffect(() => {
        try {
            window.localStorage.setItem(MESSAGE_THREADS_KEY, JSON.stringify(threads));
        } catch {}
    }, [threads]);

    useEffect(() => {
        if (!toast) return undefined;
        const timeoutId = window.setTimeout(() => setToast(""), 2400);
        return () => window.clearTimeout(timeoutId);
    }, [toast]);

    useEffect(() => {
        const chatBody = chatBodyRef.current;
        if (!chatBody) return;
        if (typeof chatBody.scrollTo === "function") {
            chatBody.scrollTo({
                top: chatBody.scrollHeight,
                behavior: "smooth",
            });
        } else {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }, [activeId, activeThread.messages.length]);

    useEffect(() => {
        setThreads((currentThreads) => {
            const currentThread = currentThreads.find((thread) => thread.id === activeId);
            if (!currentThread?.unread) return currentThreads;
            return currentThreads.map((thread) =>
                thread.id === activeId ? { ...thread, unread: 0 } : thread
            );
        });
    }, [activeId]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key !== "Escape") return;
            setIsEmojiPickerOpen(false);
            setIsThreadMenuOpen(false);
            setIsInfoOpen(false);
            setIsNewConversationOpen(false);
            setIsClearConfirmOpen(false);
            setActiveCall(null);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (!sentItems.length) return;

        setThreads((currentThreads) =>
            currentThreads.map((thread) => {
                const existingMessageIds = new Set(thread.messages.map((message) => message.id));
                const nextMessages = sentItems
                    .filter((item) => item.threadId === thread.id && !existingMessageIds.has(`share-${item.id}`))
                    .map((item) => {
                        const sharedItemLabel =
                            item.itemType === "story" ? "a story" :
                            item.itemType === "reel" ? "a reel" :
                            "a post";
                        return {
                            id: `share-${item.id}`,
                            from: "me",
                            body: `Shared ${sharedItemLabel}: ${item.title}`,
                            itemType: item.itemType,
                            preview: item.preview,
                            url: item.url,
                            time: "Now",
                        };
                    });

                if (!nextMessages.length) return thread;
                const latestMessage = nextMessages[nextMessages.length - 1];
                return {
                    ...thread,
                    preview: latestMessage.body,
                    time: "Now",
                    messages: [...thread.messages, ...nextMessages],
                };
            })
        );
    }, [sentItems]);

    const selectInboxTab = (tabId) => {
        if (activeInboxTab === tabId) return;

        const nextThreads = tabId === "challenges" ? challengeThreads : individualThreads;
        setActiveInboxTab(tabId);
        setSearchQuery("");
        if (nextThreads.length) {
            selectThread(nextThreads[0].id);
        }
    };

    const showToast = (message) => {
        setToast("");
        window.requestAnimationFrame(() => setToast(message));
    };

    const updateActiveThread = (updater) => {
        setThreads((currentThreads) =>
            currentThreads.map((thread) =>
                thread.id === activeThread.id
                    ? typeof updater === "function"
                        ? updater(thread)
                        : { ...thread, ...updater }
                    : thread
            )
        );
    };

    function selectThread(threadId) {
        setActiveId(threadId);
        setIsEmojiPickerOpen(false);
        setIsThreadMenuOpen(false);
        setPendingAttachment(null);
        setThreads((currentThreads) => {
            const requestedThread = currentThreads.find((thread) => thread.id === threadId);
            if (!requestedThread?.unread) return currentThreads;
            return currentThreads.map((thread) =>
                thread.id === threadId ? { ...thread, unread: 0 } : thread
            );
        });
    }

    useEffect(() => {
        const threadId = searchParams.get("thread");
        const requestedThread = threads.find((thread) => thread.id === threadId);
        if (requestedThread) {
            setActiveInboxTab(isChallengeThread(requestedThread) ? "challenges" : "individuals");
            selectThread(threadId);
        }
    }, [searchParams, threads]);

    const sendMessage = (messageBody = draft, attachment = pendingAttachment) => {
        const trimmed = messageBody.trim();
        if (!trimmed && !attachment) return;

        const messagePreview = trimmed || `Sent ${attachment.type.startsWith("image/") ? "an image" : attachment.name}`;

        setThreads((currentThreads) =>
            currentThreads.map((thread) =>
                thread.id === activeThread.id
                    ? {
                          ...thread,
                          preview: messagePreview,
                          time: "Now",
                          unread: 0,
                          messages: [
                              ...thread.messages,
                              {
                                  id: `${thread.id}-${Date.now()}`,
                                  from: "me",
                                  body: trimmed,
                                  attachment,
                                  time: "Now",
                                  status: "Sent",
                              },
                          ],
                      }
                    : thread
            )
        );
        setDraft("");
        setPendingAttachment(null);
        setIsEmojiPickerOpen(false);
    };

    const handleAttachmentFiles = async (fileList) => {
        const file = Array.from(fileList || [])[0];
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) {
            showToast("Choose a file smaller than 4 MB");
            return;
        }

        try {
            setPendingAttachment(await readMessageFile(file));
            showToast("Attachment ready");
        } catch {
            showToast("That file could not be loaded");
        }
    };

    const insertEmoji = (emoji) => {
        setDraft((currentDraft) => `${currentDraft}${emoji}`);
        setIsEmojiPickerOpen(false);
        window.setTimeout(() => composerRef.current?.focus(), 0);
    };

    const createConversation = (event) => {
        event.preventDefault();
        const name = newConversation.name.trim();
        if (!name) return;

        const handle = (newConversation.handle.trim() || name)
            .replace(/^@/, "")
            .toLowerCase()
            .replace(/\s+/g, ".");
        const isChallenge = newConversation.type === "challenge";
        const thread = {
            id: `thread-${Date.now()}`,
            name,
            handle: isChallenge && !handle.startsWith("challenge.") ? `challenge.${handle}` : handle,
            status: isChallenge ? "New challenge group" : "New conversation",
            time: "Now",
            unread: 0,
            tone: isChallenge ? "blue" : "green",
            goal: isChallenge ? "New challenge" : "Training partner",
            streak: 0,
            preview: "Start the conversation.",
            muted: false,
            messages: [],
        };

        setThreads((currentThreads) => [thread, ...currentThreads]);
        setActiveInboxTab(isChallenge ? "challenges" : "individuals");
        setActiveId(thread.id);
        setNewConversation({ name: "", handle: "", type: "individual" });
        setIsNewConversationOpen(false);
        showToast(`Conversation with ${name} created`);
        window.setTimeout(() => composerRef.current?.focus(), 0);
    };

    const startCall = (type) => {
        setIsCallMuted(false);
        setIsCallVideoEnabled(type === "video");
        setActiveCall({ type, startedAt: new Date().toISOString() });
    };

    const endCall = () => {
        if (!activeCall) return;
        const callLabel = activeCall.type === "video" ? "Video" : "Voice";
        const callMessage = {
            id: `${activeThread.id}-call-${Date.now()}`,
            from: "system",
            body: `${callLabel} call ended`,
            time: "Now",
        };
        updateActiveThread((thread) => ({
            ...thread,
            preview: `${callLabel} call`,
            time: "Now",
            messages: [...thread.messages, callMessage],
        }));
        setActiveCall(null);
        showToast(`${callLabel} call ended`);
    };

    const toggleMuted = () => {
        const nextMutedState = !activeThread.muted;
        updateActiveThread({ muted: nextMutedState });
        setIsThreadMenuOpen(false);
        showToast(nextMutedState ? "Notifications muted" : "Notifications unmuted");
    };

    const markConversationUnread = () => {
        updateActiveThread({ unread: Math.max(activeThread.unread || 0, 1) });
        setIsThreadMenuOpen(false);
        showToast("Conversation marked unread");
    };

    const clearConversation = () => {
        updateActiveThread({
            messages: [],
            preview: "No messages yet",
            time: "Now",
            unread: 0,
        });
        setIsClearConfirmOpen(false);
        setIsThreadMenuOpen(false);
        showToast("Conversation cleared");
    };

    const copyProfileLink = async () => {
        const activeProfileRoute = !isChallengeThread(activeThread)
            ? getProfileRoute(activeThread.handle, user)
            : null;
        const profileUrl = activeProfileRoute
            ? `${window.location.origin}${activeProfileRoute}`
            : `${window.location.origin}/messages?thread=${encodeURIComponent(activeThread.id)}`;
        try {
            await navigator.clipboard.writeText(profileUrl);
        } catch {
            const temporaryInput = document.createElement("textarea");
            temporaryInput.value = profileUrl;
            document.body.appendChild(temporaryInput);
            temporaryInput.select();
            document.execCommand("copy");
            temporaryInput.remove();
        }
        setIsThreadMenuOpen(false);
        showToast(activeProfileRoute ? "Profile link copied" : "Conversation link copied");
    };

    const activeProfileRoute = !isChallengeThread(activeThread)
        ? getProfileRoute(activeThread.handle, user)
        : null;

    return (
        <div className="messages-page">
            <header className="messages-mobile-topbar">
                <Link to="/dashboard" aria-label="Back to home" title="Back to home">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <p>DMs</p>
                    <h1>Messages</h1>
                </div>
                <button type="button" onClick={() => setIsNewConversationOpen(true)} aria-label="New DM" title="New DM">
                    <UserPlus className="h-5 w-5" />
                </button>
            </header>

            <aside className="messages-inbox">
                <div className="messages-inbox-header">
                    <div>
                        <p>Inbox</p>
                        <h1>Messages</h1>
                    </div>
                    <button type="button" onClick={() => setIsNewConversationOpen(true)} aria-label="New DM" title="New DM">
                        <UserPlus className="h-5 w-5" />
                    </button>
                </div>

                <label className="messages-search">
                    <Search className="h-4 w-4" />
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder={activeInboxTab === "challenges" ? "Search challenge DMs" : "Search individual DMs"}
                    />
                    {searchQuery && (
                        <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear message search">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </label>

                <div className="messages-inbox-tabs" role="tablist" aria-label="Message type">
                    {inboxTabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            className={activeInboxTab === tab.id ? "active" : ""}
                            onClick={() => selectInboxTab(tab.id)}
                            role="tab"
                            aria-selected={activeInboxTab === tab.id}
                        >
                            <span>{tab.label}</span>
                            <b>{tab.unread || tab.count}</b>
                        </button>
                    ))}
                </div>

                <div className="messages-note-row" aria-label={activeInboxTab === "challenges" ? "Challenge chats" : "Active friends"}>
                    {visibleThreads.map((thread) => (
                        <button
                            key={`note-${thread.id}`}
                            type="button"
                            className={thread.id === activeThread.id ? "active" : ""}
                            onClick={() => selectThread(thread.id)}
                        >
                            <span className={`messages-avatar tone-${thread.tone}`}>{getInitials(thread.name)}</span>
                            <small>{thread.name.split(" ")[0]}</small>
                        </button>
                    ))}
                </div>

                <div className="messages-thread-list">
                    {visibleThreads.map((thread) => (
                        <button
                            key={thread.id}
                            type="button"
                            className={`messages-thread ${thread.id === activeThread.id ? "active" : ""}`}
                            onClick={() => selectThread(thread.id)}
                        >
                            <span className={`messages-avatar tone-${thread.tone}`}>{getInitials(thread.name)}</span>
                            <span className="messages-thread-copy">
                                <strong>{thread.name}</strong>
                                <small>{thread.preview}</small>
                            </span>
                            <span className="messages-thread-meta">
                                <em>{thread.time}</em>
                                {thread.muted && <BellOff className="h-3.5 w-3.5" aria-label="Muted" />}
                                {thread.unread > 0 && <b>{thread.unread}</b>}
                            </span>
                        </button>
                    ))}
                    {!visibleThreads.length && (
                        <div className="messages-search-empty">
                            <Search className="h-5 w-5" />
                            <strong>No conversations found</strong>
                            <span>Try another name or message keyword.</span>
                            <button type="button" onClick={() => setSearchQuery("")}>Clear search</button>
                        </div>
                    )}
                </div>
            </aside>

            <main className="messages-chat">
                <header className="messages-chat-header">
                    {activeProfileRoute ? (
                        <Link to={activeProfileRoute} className="messages-chat-profile-link">
                            <span className={`messages-avatar tone-${activeThread.tone}`}>{getInitials(activeThread.name)}</span>
                            <span>
                                <span className="messages-chat-profile-name">{activeThread.name}</span>
                                <span className="messages-chat-profile-status">{activeThread.status}</span>
                            </span>
                        </Link>
                    ) : (
                        <>
                            <div className={`messages-avatar tone-${activeThread.tone}`}>{getInitials(activeThread.name)}</div>
                            <div>
                                <h2>{activeThread.name}</h2>
                                <p>{activeThread.status}</p>
                            </div>
                        </>
                    )}
                    <div className="messages-chat-actions">
                        <button type="button" onClick={() => startCall("voice")} aria-label="Voice call" title="Voice call">
                            <Phone className="h-5 w-5" />
                        </button>
                        <button type="button" onClick={() => startCall("video")} aria-label="Video call" title="Video call">
                            <Video className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            className={isInfoOpen ? "active" : ""}
                            onClick={() => setIsInfoOpen(true)}
                            aria-label="Conversation info"
                            title="Conversation info"
                            aria-expanded={isInfoOpen}
                        >
                            <Info className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                <section ref={chatBodyRef} className="messages-chat-body" aria-label={`Conversation with ${activeThread.name}`}>
                    <div className="messages-chat-intro">
                        {activeProfileRoute ? (
                            <Link to={activeProfileRoute} className="messages-chat-intro-link">
                                <span className={`messages-avatar messages-avatar-large tone-${activeThread.tone}`}>
                                    {getInitials(activeThread.name)}
                                </span>
                                <strong>{activeThread.name}</strong>
                                <small>@{activeThread.handle}</small>
                            </Link>
                        ) : (
                            <>
                                <div className={`messages-avatar messages-avatar-large tone-${activeThread.tone}`}>
                                    {getInitials(activeThread.name)}
                                </div>
                                <h2>{activeThread.name}</h2>
                                <p>@{activeThread.handle}</p>
                            </>
                        )}
                    </div>

                    {!activeThread.messages.length && (
                        <div className="messages-chat-empty">
                            <MessageCircle className="h-6 w-6" />
                            <strong>Start the conversation</strong>
                            <p>Send a message, attach a training photo, or use a quick reply below.</p>
                        </div>
                    )}

                    {activeThread.messages.map((message) => (
                        <div
                            key={message.id}
                            className={`messages-bubble-row ${message.from === "me" ? "mine" : ""} ${message.from === "system" ? "system" : ""}`}
                        >
                            {message.from !== "me" && (
                                message.from !== "system" && (
                                    <span className={`messages-avatar messages-avatar-small tone-${activeThread.tone}`}>
                                        {getInitials(activeThread.name)}
                                    </span>
                                )
                            )}
                            <div className={`messages-bubble ${message.from === "me" ? "mine" : ""} ${message.from === "system" ? "system" : ""}`}>
                                {message.body && <p>{message.body}</p>}
                                {message.attachment && (
                                    message.attachment.type.startsWith("image/") ? (
                                        <a
                                            className="messages-image-attachment"
                                            href={message.attachment.src}
                                            download={message.attachment.name}
                                            aria-label={`Open ${message.attachment.name}`}
                                        >
                                            <img src={message.attachment.src} alt={message.attachment.name} />
                                            <span>{message.attachment.name}</span>
                                        </a>
                                    ) : (
                                        <a
                                            className="messages-file-attachment"
                                            href={message.attachment.src}
                                            download={message.attachment.name}
                                        >
                                            <FileText className="h-5 w-5" />
                                            <span>
                                                <strong>{message.attachment.name}</strong>
                                                <small>{formatFileSize(message.attachment.size)}</small>
                                            </span>
                                        </a>
                                    )
                                )}
                                {message.preview && <small>{message.preview}</small>}
                                {message.url && (
                                    <a href={message.url}>
                                        Open {message.itemType || (message.body.includes("story") ? "story" : "post")}
                                    </a>
                                )}
                                <span className="messages-bubble-meta">
                                    {message.time}
                                    {message.from === "me" && (
                                        <em>
                                            <Check className="h-3 w-3" />
                                            {message.status || "Sent"}
                                        </em>
                                    )}
                                </span>
                            </div>
                        </div>
                    ))}
                </section>

                <div className="messages-quick-replies">
                    {quickReplies.map((reply) => (
                        <button key={reply} type="button" onClick={() => sendMessage(reply)}>
                            {reply}
                        </button>
                    ))}
                </div>

                <form
                    className="messages-composer"
                    onSubmit={(event) => {
                        event.preventDefault();
                        sendMessage();
                    }}
                >
                    {pendingAttachment && (
                        <div className="messages-attachment-draft">
                            {pendingAttachment.type.startsWith("image/") ? (
                                <img src={pendingAttachment.src} alt="" />
                            ) : (
                                <FileText className="h-5 w-5" />
                            )}
                            <span>
                                <strong>{pendingAttachment.name}</strong>
                                <small>{formatFileSize(pendingAttachment.size)}</small>
                            </span>
                            <button type="button" onClick={() => setPendingAttachment(null)} aria-label="Remove attachment">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.txt,.doc,.docx"
                        hidden
                        onChange={(event) => {
                            handleAttachmentFiles(event.target.files);
                            event.target.value = "";
                        }}
                    />
                    <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Add media" title="Add media">
                        <ImagePlus className="h-5 w-5" />
                    </button>
                    <textarea
                        ref={composerRef}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                sendMessage();
                            }
                        }}
                        rows={1}
                        maxLength={2000}
                        placeholder={`Message ${activeThread.name.split(" ")[0]}`}
                        aria-label={`Message ${activeThread.name.split(" ")[0]}`}
                    />
                    <button
                        type="button"
                        className={isEmojiPickerOpen ? "active" : ""}
                        onClick={() => setIsEmojiPickerOpen((isOpen) => !isOpen)}
                        aria-label="Add reaction"
                        title="Add reaction"
                        aria-expanded={isEmojiPickerOpen}
                    >
                        <Smile className="h-5 w-5" />
                    </button>
                    <button
                        type="submit"
                        disabled={!draft.trim() && !pendingAttachment}
                        aria-label="Send message"
                        title="Send message"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                    {isEmojiPickerOpen && (
                        <div className="messages-emoji-picker" aria-label="Quick reactions">
                            {quickEmojis.map((emoji) => (
                                <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} aria-label={`Add ${emoji}`}>
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </form>
            </main>

            <aside className="messages-details">
                <section className="messages-details-card">
                    {activeProfileRoute ? (
                        <Link to={activeProfileRoute} className="messages-details-profile-link">
                            <span className={`messages-avatar messages-avatar-large tone-${activeThread.tone}`}>
                                {getInitials(activeThread.name)}
                            </span>
                            <strong>{activeThread.name}</strong>
                            <small>@{activeThread.handle}</small>
                        </Link>
                    ) : (
                        <>
                            <div className={`messages-avatar messages-avatar-large tone-${activeThread.tone}`}>
                                {getInitials(activeThread.name)}
                            </div>
                            <h2>{activeThread.name}</h2>
                            <p>@{activeThread.handle}</p>
                        </>
                    )}
                    {activeThread.muted && (
                        <span className="messages-muted-label">
                            <BellOff className="h-3.5 w-3.5" />
                            Muted
                        </span>
                    )}
                    <div className="messages-detail-actions">
                        <button
                            type="button"
                            onClick={() => composerRef.current?.focus()}
                            aria-label="Write message"
                            title="Write message"
                        >
                            <Mail className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            className={isThreadMenuOpen ? "active" : ""}
                            onClick={() => setIsThreadMenuOpen((isOpen) => !isOpen)}
                            aria-label="More conversation actions"
                            title="More"
                            aria-expanded={isThreadMenuOpen}
                        >
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                        {isThreadMenuOpen && (
                            <div className="messages-thread-menu">
                                <button type="button" onClick={toggleMuted}>
                                    {activeThread.muted ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                                    {activeThread.muted ? "Unmute notifications" : "Mute notifications"}
                                </button>
                                <button type="button" onClick={markConversationUnread}>
                                    <Mail className="h-4 w-4" />
                                    Mark as unread
                                </button>
                                <button type="button" onClick={copyProfileLink}>
                                    <Copy className="h-4 w-4" />
                                    {activeProfileRoute ? "Copy profile link" : "Copy conversation link"}
                                </button>
                                <button type="button" className="danger" onClick={() => setIsClearConfirmOpen(true)}>
                                    <Trash2 className="h-4 w-4" />
                                    Clear conversation
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                <section className="messages-details-card">
                    <div className="messages-details-heading">
                        <Trophy className="h-5 w-5 tone-gold" />
                        <h2>{activeThread.goal}</h2>
                    </div>
                    <div className="messages-goal-grid">
                        <div>
                            <Flame className="h-4 w-4 tone-orange" />
                            <strong>{activeThread.streak}</strong>
                            <span>day streak</span>
                        </div>
                        <div>
                            <Dumbbell className="h-4 w-4 tone-green" />
                            <strong>4</strong>
                            <span>sessions</span>
                        </div>
                    </div>
                </section>

                <section className="messages-details-card">
                    <div className="messages-details-heading">
                        <ShieldCheck className="h-5 w-5 tone-blue" />
                        <h2>Privacy</h2>
                    </div>
                    <p className="messages-details-copy">
                        Weight goals, weigh-ins, and challenge notes stay in DMs unless shared to a story.
                    </p>
                </section>

                <section className="messages-details-card messages-self-card">
                    <Zap className="h-5 w-5 tone-orange" />
                    <div>
                        <h2>{capitalizedName}</h2>
                        <p>{totalUnread} unread {totalUnread === 1 ? "DM" : "DMs"}</p>
                    </div>
                </section>
            </aside>

            {isNewConversationOpen && (
                <div className="messages-dialog-backdrop" role="presentation" onMouseDown={() => setIsNewConversationOpen(false)}>
                    <form
                        className="messages-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="messages-new-title"
                        onSubmit={createConversation}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <header>
                            <div>
                                <p>New message</p>
                                <h2 id="messages-new-title">Start a conversation</h2>
                            </div>
                            <button type="button" onClick={() => setIsNewConversationOpen(false)} aria-label="Close new conversation">
                                <X className="h-5 w-5" />
                            </button>
                        </header>
                        <div className="messages-new-type" role="radiogroup" aria-label="Conversation type">
                            <button
                                type="button"
                                className={newConversation.type === "individual" ? "active" : ""}
                                onClick={() => setNewConversation((current) => ({ ...current, type: "individual" }))}
                                role="radio"
                                aria-checked={newConversation.type === "individual"}
                            >
                                <UserPlus className="h-4 w-4" />
                                Individual
                            </button>
                            <button
                                type="button"
                                className={newConversation.type === "challenge" ? "active" : ""}
                                onClick={() => setNewConversation((current) => ({ ...current, type: "challenge" }))}
                                role="radio"
                                aria-checked={newConversation.type === "challenge"}
                            >
                                <Users className="h-4 w-4" />
                                Challenge group
                            </button>
                        </div>
                        <label>
                            <span>Name</span>
                            <input
                                autoFocus
                                value={newConversation.name}
                                onChange={(event) =>
                                    setNewConversation((current) => ({ ...current, name: event.target.value }))
                                }
                                maxLength={60}
                                placeholder={newConversation.type === "challenge" ? "Weekend step crew" : "Training partner"}
                            />
                        </label>
                        <label>
                            <span>Handle</span>
                            <input
                                value={newConversation.handle}
                                onChange={(event) =>
                                    setNewConversation((current) => ({ ...current, handle: event.target.value }))
                                }
                                maxLength={60}
                                placeholder="@handle (optional)"
                            />
                        </label>
                        <footer>
                            <button type="button" onClick={() => setIsNewConversationOpen(false)}>Cancel</button>
                            <button type="submit" className="primary" disabled={!newConversation.name.trim()}>
                                <Send className="h-4 w-4" />
                                Create chat
                            </button>
                        </footer>
                    </form>
                </div>
            )}

            {activeCall && (
                <div className="messages-call-backdrop" role="presentation">
                    <section className={`messages-call-card tone-${activeThread.tone}`} role="dialog" aria-modal="true" aria-label={`${activeCall.type} call with ${activeThread.name}`}>
                        <span className={`messages-avatar messages-call-avatar tone-${activeThread.tone}`}>
                            {getInitials(activeThread.name)}
                        </span>
                        <p>{activeCall.type === "video" ? "Video call" : "Voice call"}</p>
                        <h2>{activeThread.name}</h2>
                        <span className="messages-call-status">Connected</span>
                        <div className="messages-call-actions">
                            <button
                                type="button"
                                className={isCallMuted ? "active" : ""}
                                onClick={() => setIsCallMuted((isMuted) => !isMuted)}
                                aria-label={isCallMuted ? "Unmute microphone" : "Mute microphone"}
                            >
                                {isCallMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                            </button>
                            {activeCall.type === "video" && (
                                <button
                                    type="button"
                                    className={!isCallVideoEnabled ? "active" : ""}
                                    onClick={() => setIsCallVideoEnabled((isEnabled) => !isEnabled)}
                                    aria-label={isCallVideoEnabled ? "Turn camera off" : "Turn camera on"}
                                >
                                    {isCallVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                                </button>
                            )}
                            <button type="button" className="end" onClick={endCall} aria-label="End call">
                                <PhoneOff className="h-5 w-5" />
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {isInfoOpen && (
                <div className="messages-info-backdrop" role="presentation" onMouseDown={() => setIsInfoOpen(false)}>
                    <aside
                        className="messages-info-drawer"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="messages-info-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <header>
                            <div>
                                <p>Conversation</p>
                                <h2 id="messages-info-title">Details</h2>
                            </div>
                            <button type="button" onClick={() => setIsInfoOpen(false)} aria-label="Close conversation info">
                                <X className="h-5 w-5" />
                            </button>
                        </header>
                        <section className="messages-info-profile">
                            {activeProfileRoute ? (
                                <Link to={activeProfileRoute} className="messages-info-profile-link" onClick={() => setIsInfoOpen(false)}>
                                    <span className={`messages-avatar messages-avatar-large tone-${activeThread.tone}`}>
                                        {getInitials(activeThread.name)}
                                    </span>
                                    <strong>{activeThread.name}</strong>
                                    <small>@{activeThread.handle}</small>
                                </Link>
                            ) : (
                                <>
                                    <span className={`messages-avatar messages-avatar-large tone-${activeThread.tone}`}>
                                        {getInitials(activeThread.name)}
                                    </span>
                                    <h3>{activeThread.name}</h3>
                                    <p>@{activeThread.handle}</p>
                                </>
                            )}
                            <span>{activeThread.status}</span>
                        </section>
                        <section className="messages-info-actions">
                            <button type="button" onClick={toggleMuted}>
                                {activeThread.muted ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                                <span>{activeThread.muted ? "Unmute" : "Mute"}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsInfoOpen(false);
                                    window.setTimeout(() => composerRef.current?.focus(), 0);
                                }}
                            >
                                <Mail className="h-5 w-5" />
                                <span>Message</span>
                            </button>
                            <button type="button" onClick={copyProfileLink}>
                                <Copy className="h-5 w-5" />
                                <span>{activeProfileRoute ? "Copy profile" : "Copy link"}</span>
                            </button>
                            <button type="button" onClick={markConversationUnread}>
                                <Mail className="h-5 w-5" />
                                <span>Mark unread</span>
                            </button>
                        </section>
                        <section className="messages-info-section">
                            <h3>Shared in this conversation</h3>
                            <div>
                                <ImagePlus className="h-4 w-4" />
                                <span>Media</span>
                                <strong>{sharedMediaCount}</strong>
                            </div>
                            <div>
                                <Trophy className="h-4 w-4" />
                                <span>{activeThread.goal}</span>
                                <strong>{activeThread.streak}d</strong>
                            </div>
                        </section>
                        <button type="button" className="messages-info-danger" onClick={() => setIsClearConfirmOpen(true)}>
                            <Trash2 className="h-4 w-4" />
                            Clear conversation
                        </button>
                    </aside>
                </div>
            )}

            {isClearConfirmOpen && (
                <div className="messages-dialog-backdrop messages-confirm-backdrop" role="presentation" onMouseDown={() => setIsClearConfirmOpen(false)}>
                    <section
                        className="messages-dialog messages-confirm-dialog"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="messages-clear-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <span className="messages-confirm-icon"><Trash2 className="h-6 w-6" /></span>
                        <h2 id="messages-clear-title">Clear this conversation?</h2>
                        <p>This removes the visible messages from this browser. The conversation itself will remain.</p>
                        <footer>
                            <button type="button" onClick={() => setIsClearConfirmOpen(false)}>Cancel</button>
                            <button type="button" className="danger" onClick={clearConversation}>Clear messages</button>
                        </footer>
                    </section>
                </div>
            )}

            {toast && (
                <div className="messages-toast" role="status" aria-live="polite">
                    <Check className="h-4 w-4" />
                    {toast}
                </div>
            )}
        </div>
    );
};

export default Messages;
