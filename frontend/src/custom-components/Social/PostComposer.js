import {
    ArrowLeft,
    AtSign,
    Check,
    Clapperboard,
    Dumbbell,
    Globe2,
    ImagePlus,
    MapPin,
    Music2,
    Play,
    Plus,
    Scissors,
    Send,
    SlidersHorizontal,
    Type,
    Volume2,
    X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocialPosts } from "../../context/SocialPostsContext";

const samplePhotos = [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1100&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1100&q=80",
];

const defaultWorkoutDetails = {
    title: "Workout complete",
    duration: "46 min",
    volume: "12,840 lb",
    exercises: [
        { name: "Bench press", detail: "4 x 6 at 185 lb" },
        { name: "Incline DB press", detail: "3 x 10 at 60 lb" },
        { name: "Cable fly", detail: "3 x 12 at 35 lb" },
    ],
};

const splitTags = (value) =>
    value
        .split(/[, ]+/)
        .map((tag) => tag.replace(/^@/, "").trim())
        .filter(Boolean);

const makeExerciseText = (exercises = []) =>
    exercises.map((exercise) => `${exercise.name}: ${exercise.detail}`).join("\n");

const parseExerciseText = (value) =>
    value
        .split("\n")
        .map((line) => {
            const [name, ...detailParts] = line.split(":");
            return {
                name: name?.trim(),
                detail: detailParts.join(":").trim(),
            };
        })
        .filter((exercise) => exercise.name && exercise.detail);

const composerStages = ["media", "details", "workout"];
const getExpectedMediaType = (type) => (type === "reel" ? "video" : "photo");
const getMediaNoun = (mediaType, count = 2) => {
    if (mediaType === "video") return count === 1 ? "video" : "videos";
    return count === 1 ? "photo" : "photos";
};
const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

const isVideoSource = (src = "") => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src);

const readMediaFile = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
            resolve({
                src: reader.result,
                label: file.name.replace(/\.[^.]+$/, "") || "Training media",
                type: file.type.startsWith("video/") ? "video" : "photo",
            });
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const PostComposer = () => {
    const { user } = useAuth();
    const { closeComposer, composerDefaults, createPost, isComposerOpen } = useSocialPosts();
    const fileInputRef = useRef(null);
    const timelineTrackRef = useRef(null);
    const [stage, setStage] = useState("media");
    const [postType, setPostType] = useState("post");
    const [caption, setCaption] = useState("");
    const [description, setDescription] = useState("");
    const [tagText, setTagText] = useState("");
    const [location, setLocation] = useState("");
    const [audience, setAudience] = useState("Friends");
    const [musicTrack, setMusicTrack] = useState("");
    const [includeWorkout, setIncludeWorkout] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);
    const [mediaUrl, setMediaUrl] = useState("");
    const [workout, setWorkout] = useState(defaultWorkoutDetails);
    const [exerciseText, setExerciseText] = useState(makeExerciseText(workout.exercises));
    const [clipStart, setClipStart] = useState(0);
    const [clipEnd, setClipEnd] = useState(18);
    const [clipCover, setClipCover] = useState(5);
    const [clipSpeed, setClipSpeed] = useState("1x");
    const [mediaNotice, setMediaNotice] = useState("");

    const authorName = user ? user.charAt(0).toUpperCase() + user.slice(1) : "You";
    const tags = useMemo(() => splitTags(tagText), [tagText]);
    const modalRoot = typeof document === "undefined" ? null : document.body;
    const activePhoto = photos[activePhotoIndex] || photos[0] || null;
    const canContinue = photos.some((photo) => photo.src?.trim());
    const expectedMediaType = getExpectedMediaType(postType);
    const mediaPlural = getMediaNoun(expectedMediaType);
    const stageTitle = stage === "media" ? "Create" : stage === "details" ? "Details" : "Workout";
    const showWorkoutPreview = stage === "workout" && includeWorkout && activePhotoIndex === photos.length;
    const totalSlides = photos.length + (includeWorkout ? 1 : 0);
    const displaySlideIndex = showWorkoutPreview ? photos.length + 1 : Math.min(activePhotoIndex + 1, photos.length);
    const reelDuration = 60;
    const clipLength = Math.max(1, clipEnd - clipStart);
    const clipCoverPosition = Math.round((clipCover / reelDuration) * 100);
    const clipStartPosition = Math.round((clipStart / reelDuration) * 100);
    const clipEndPosition = Math.round((clipEnd / reelDuration) * 100);
    const timelineMedia = photos.length ? photos : [{ label: "Add media", type: "empty" }];

    useEffect(() => {
        if (!isComposerOpen) return;

        const defaults = composerDefaults || {};
        const defaultWorkout = defaults.workout || defaultWorkoutDetails;
        const initialPostType = defaults.postType || "post";
        const initialMediaType = getExpectedMediaType(initialPostType);
        setStage("media");
        setPostType(initialPostType);
        setCaption(defaults.caption || "");
        setDescription(defaults.description || "");
        setTagText(defaults.tags?.join(", ") || "");
        setLocation(defaults.location || "");
        setAudience(defaults.audience || "Friends");
        setMusicTrack(defaults.music?.title || defaults.music || "");
        setIncludeWorkout(defaults.source === "workout" || !!defaults.workout);
        setPhotos(defaults.photos?.length ? defaults.photos.filter((photo) => (photo.type === "video" ? "video" : "photo") === initialMediaType) : []);
        setActivePhotoIndex(0);
        setMediaUrl("");
        setMediaNotice("");
        setWorkout(defaultWorkout);
        setExerciseText(makeExerciseText(defaultWorkout.exercises));
        setClipStart(defaults.clip?.start ?? 0);
        setClipEnd(defaults.clip?.end ?? 18);
        setClipCover(defaults.clip?.cover ?? 5);
        setClipSpeed(defaults.clip?.speed || "1x");
    }, [composerDefaults, isComposerOpen]);

    useEffect(() => {
        setWorkout((currentWorkout) => ({
            ...currentWorkout,
            exercises: parseExerciseText(exerciseText),
        }));
    }, [exerciseText]);

    useEffect(() => {
        setClipCover((currentCover) => Math.min(Math.max(currentCover, clipStart), clipEnd));
    }, [clipEnd, clipStart]);

    useEffect(() => {
        if (stage === "workout" && includeWorkout) {
            setActivePhotoIndex(photos.length);
        }
    }, [includeWorkout, photos.length, stage]);

    useEffect(() => {
        if ((stage !== "workout" || !includeWorkout) && photos.length > 0 && activePhotoIndex >= photos.length) {
            setActivePhotoIndex(photos.length - 1);
        }
    }, [activePhotoIndex, includeWorkout, photos.length, stage]);

    if (!isComposerOpen || !modalRoot) return null;

    const handlePostTypeChange = (nextPostType) => {
        const nextMediaType = getExpectedMediaType(nextPostType);
        setPostType(nextPostType);
        setPhotos((currentPhotos) => currentPhotos.filter((photo) => (photo.type === "video" ? "video" : "photo") === nextMediaType));
        setActivePhotoIndex(0);
        setMediaNotice("");
    };

    const handleFiles = async (fileList) => {
        const files = Array.from(fileList || []);
        const mediaFiles = files.filter((file) =>
            expectedMediaType === "video" ? file.type.startsWith("video/") : file.type.startsWith("image/")
        );
        if (!mediaFiles.length) {
            if (files.length) setMediaNotice(`Only ${mediaPlural} can be added to this ${postType === "reel" ? "reel" : "post"}.`);
            return;
        }

        setMediaNotice(files.length !== mediaFiles.length ? `Only ${mediaPlural} can be added to this ${postType === "reel" ? "reel" : "post"}.` : "");
        const nextPhotos = (await Promise.all(mediaFiles.map(readMediaFile))).map((media) => ({
            ...media,
            type: expectedMediaType,
        }));
        setPhotos((currentPhotos) => {
            return currentPhotos.length ? [...currentPhotos, ...nextPhotos] : nextPhotos;
        });
        setActivePhotoIndex(0);
    };

    const addMediaUrl = () => {
        const nextUrl = mediaUrl.trim();
        if (!nextUrl) return;
        const nextMediaType = isVideoSource(nextUrl) ? "video" : "photo";

        if (nextMediaType !== expectedMediaType) {
            setMediaNotice(`Switch to ${nextMediaType === "video" ? "Reel" : "Post"} to add that ${getMediaNoun(nextMediaType, 1)}.`);
            return;
        }

        setPhotos((currentPhotos) => [...currentPhotos, { src: nextUrl, label: `Slide ${currentPhotos.length + 1}`, type: expectedMediaType }]);
        setActivePhotoIndex(photos.length);
        setMediaUrl("");
        setMediaNotice("");
    };

    const removePhoto = (index) => {
        setPhotos((currentPhotos) => {
            if (currentPhotos.length === 1) return currentPhotos;
            const nextPhotos = currentPhotos.filter((_, photoIndex) => photoIndex !== index);
            setActivePhotoIndex((currentIndex) => Math.min(currentIndex, nextPhotos.length - 1));
            return nextPhotos;
        });
    };

    const publishPost = () => {
        if (!canContinue) return;
        const publishMedia = photos.filter((photo) => (photo.type === "video" ? "video" : "photo") === expectedMediaType && photo.src?.trim());

        createPost({
            authorName,
            handle: user || "you",
            caption,
            description,
            tags,
            location,
            audience,
            photos: publishMedia,
            includeWorkout,
            workout,
            postType,
            music: musicTrack ? { title: musicTrack } : null,
            clip: postType === "reel" ? { start: clipStart, end: clipEnd, cover: clipCover, speed: clipSpeed } : null,
        });
        closeComposer();
    };

    const closeOrBack = () => {
        const currentStageIndex = composerStages.indexOf(stage);
        if (currentStageIndex > 0) {
            setStage(composerStages[currentStageIndex - 1]);
            return;
        }

        closeComposer();
    };

    const advanceStage = () => {
        if (stage === "workout") {
            publishPost();
            return;
        }

        const currentStageIndex = composerStages.indexOf(stage);
        setStage(composerStages[Math.min(currentStageIndex + 1, composerStages.length - 1)]);
    };

    const getTimelineSecond = (clientX) => {
        const trackRect = timelineTrackRef.current?.getBoundingClientRect();
        if (!trackRect?.width) return 0;

        const progress = clampValue((clientX - trackRect.left) / trackRect.width, 0, 1);
        return Math.round(progress * reelDuration);
    };

    const updateTimelineHandle = (handle, clientX) => {
        const nextSecond = getTimelineSecond(clientX);

        if (handle === "start") {
            const nextStart = clampValue(nextSecond, 0, clipEnd - 1);
            setClipStart(nextStart);
            setClipCover((currentCover) => Math.max(currentCover, nextStart));
            return;
        }

        if (handle === "end") {
            const nextEnd = clampValue(nextSecond, clipStart + 1, reelDuration);
            setClipEnd(nextEnd);
            setClipCover((currentCover) => Math.min(currentCover, nextEnd));
            return;
        }

        setClipCover(clampValue(nextSecond, clipStart, clipEnd));
    };

    const startTimelineDrag = (handle, event) => {
        event.preventDefault();
        event.stopPropagation();
        updateTimelineHandle(handle, event.clientX);

        const handlePointerMove = (moveEvent) => {
            moveEvent.preventDefault();
            updateTimelineHandle(handle, moveEvent.clientX);
        };

        const stopTimelineDrag = () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", stopTimelineDrag);
            window.removeEventListener("pointercancel", stopTimelineDrag);
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", stopTimelineDrag);
        window.addEventListener("pointercancel", stopTimelineDrag);
    };

    return createPortal(
        <div className="post-composer-overlay" role="dialog" aria-modal="true" aria-label="Create post">
            <div className={`post-composer post-composer-modern is-${stage}`}>
                <header className="post-composer-header">
                    <button type="button" onClick={closeOrBack} aria-label={stage === "media" ? "Close composer" : "Back"} title={stage === "media" ? "Close" : "Back"}>
                        {stage === "media" ? <X className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
                    </button>
                    <div className="post-composer-title">
                        <h2>{stageTitle}</h2>
                    </div>
                    {stage === "workout" ? (
                        <button type="button" className="post-composer-next-button" onClick={publishPost} disabled={!canContinue}>
                            <Send className="h-4 w-4" />
                            Share
                        </button>
                    ) : (
                        <button type="button" className="post-composer-next-button" onClick={advanceStage} disabled={!canContinue}>
                            Next
                        </button>
                    )}
                </header>

                <div className="post-composer-studio">
                    <section className={`post-media-stage ${postType === "reel" && stage !== "workout" ? "has-timeline" : ""}`}>
                        <div className={`post-media-frame ${postType === "reel" && !showWorkoutPreview ? "is-reel" : ""} ${showWorkoutPreview ? "is-workout-preview" : ""}`}>
                            {showWorkoutPreview ? (
                                <div className="post-workout-slide-preview">
                                    <span><Dumbbell className="h-5 w-5" /></span>
                                    <strong>{workout.title || "Workout complete"}</strong>
                                    <div>
                                        <small>{workout.duration || "Duration"}</small>
                                        <small>{workout.volume || "Volume"}</small>
                                    </div>
                                    <ul>
                                        {(workout.exercises?.length ? workout.exercises : defaultWorkoutDetails.exercises).slice(0, 4).map((exercise) => (
                                            <li key={`${exercise.name}-${exercise.detail}`}>
                                                <b>{exercise.name}</b>
                                                <em>{exercise.detail}</em>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : activePhoto?.type === "video" ? (
                                <video src={activePhoto.src} controls muted playsInline />
                            ) : activePhoto?.src ? (
                                <img src={activePhoto.src} alt={activePhoto.label || "Selected post media"} />
                            ) : (
                                <ImagePlus className="h-10 w-10" />
                            )}
                            {photos.length > 0 && <span className="post-media-count">{displaySlideIndex}/{totalSlides}</span>}
                        </div>

                        <div className="post-media-strip" aria-label="Post media">
                            {photos.map((photo, index) => (
                                <button
                                    key={`${photo.src}-${index}`}
                                    type="button"
                                    className={!showWorkoutPreview && activePhotoIndex === index ? "active" : ""}
                                    onClick={() => setActivePhotoIndex(index)}
                                    aria-label={`Select media ${index + 1}`}
                                >
                                    {photo.type === "video" ? (
                                        <video src={photo.src} muted playsInline />
                                    ) : photo.src ? (
                                        <img src={photo.src} alt="" />
                                    ) : (
                                        <ImagePlus className="h-4 w-4" />
                                    )}
                                    {photos.length > 1 && (
                                        <span onClick={(event) => {
                                            event.stopPropagation();
                                            removePhoto(index);
                                        }}>
                                            <X className="h-3 w-3" />
                                        </span>
                                    )}
                                </button>
                            ))}
                            <button type="button" className="add" onClick={() => fileInputRef.current?.click()} aria-label="Add media">
                                <Plus className="h-4 w-4" />
                            </button>
                            {includeWorkout && (
                                <button
                                    type="button"
                                    className={showWorkoutPreview ? "active workout" : "workout"}
                                    onClick={() => {
                                        setStage("workout");
                                        setActivePhotoIndex(photos.length);
                                    }}
                                    aria-label="Preview workout slide"
                                >
                                    <Dumbbell className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {postType === "reel" && stage !== "workout" && (
                            <section className="post-reel-timeline" aria-label="Reel video timeline">
                                <div className="post-reel-timeline-header">
                                    <div>
                                        <strong>Video timeline</strong>
                                        <span>{clipLength}s clip / {clipSpeed} speed</span>
                                    </div>
                                    <div className="post-reel-tool-row">
                                        <button type="button"><Play className="h-4 w-4" /> Preview</button>
                                        <button type="button"><Scissors className="h-4 w-4" /> Split</button>
                                        <button type="button"><Type className="h-4 w-4" /> Text</button>
                                        <button type="button"><Volume2 className="h-4 w-4" /> Voice</button>
                                    </div>
                                </div>
                                <div className="post-reel-ruler">
                                    {[0, 10, 20, 30, 40, 50, 60].map((second) => (
                                        <span key={second}>{second}s</span>
                                    ))}
                                </div>
                                <div
                                    ref={timelineTrackRef}
                                    className="post-reel-track"
                                    style={{
                                        "--cover-position": `${clipCoverPosition}%`,
                                        "--trim-start": `${clipStartPosition}%`,
                                        "--trim-end": `${clipEndPosition}%`,
                                    }}
                                >
                                    <div className="post-reel-track-lane">
                                        {timelineMedia.map((media, index) => (
                                            <button
                                                key={`${media.src || media.label}-${index}`}
                                                type="button"
                                                className={`post-reel-clip ${activePhotoIndex === index ? "active" : ""}`}
                                                onClick={() => media.src && setActivePhotoIndex(index)}
                                            >
                                                {media.type === "video" ? (
                                                    <video src={media.src} muted playsInline />
                                                ) : media.src ? (
                                                    <img src={media.src} alt="" />
                                                ) : (
                                                    <ImagePlus className="h-4 w-4" />
                                                )}
                                                <span>{media.type === "video" ? "Video" : media.label || `Clip ${index + 1}`}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        className="post-reel-trim start"
                                        onPointerDown={(event) => startTimelineDrag("start", event)}
                                        aria-label="Drag trim start"
                                        title="Trim start"
                                    />
                                    <button
                                        type="button"
                                        className="post-reel-trim end"
                                        onPointerDown={(event) => startTimelineDrag("end", event)}
                                        aria-label="Drag trim end"
                                        title="Trim end"
                                    />
                                    <button
                                        type="button"
                                        className="post-reel-playhead"
                                        onPointerDown={(event) => startTimelineDrag("cover", event)}
                                        aria-label="Drag cover frame"
                                        title="Cover frame"
                                    />
                                </div>
                                <div className="post-reel-audio-lane">
                                    <Music2 className="h-4 w-4" />
                                    <span>{musicTrack || "Add music on the details step"}</span>
                                </div>
                            </section>
                        )}
                    </section>

                    {stage === "media" ? (
                        <aside className="post-media-tools">
                            <div className="post-type-switch" role="tablist" aria-label="Post type">
                                <button type="button" className={postType === "post" ? "active" : ""} onClick={() => handlePostTypeChange("post")}>
                                    <ImagePlus className="h-4 w-4" />
                                    Post
                                </button>
                                <button type="button" className={postType === "reel" ? "active" : ""} onClick={() => handlePostTypeChange("reel")}>
                                    <Clapperboard className="h-4 w-4" />
                                    Reel
                                </button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={expectedMediaType === "video" ? "video/*" : "image/*"}
                                multiple
                                hidden
                                onChange={(event) => {
                                    handleFiles(event.target.files);
                                    event.target.value = "";
                                }}
                            />

                            <button type="button" className="post-upload-card" onClick={() => fileInputRef.current?.click()}>
                                {expectedMediaType === "video" ? <Clapperboard className="h-6 w-6" /> : <ImagePlus className="h-6 w-6" />}
                                <span>Choose {mediaPlural}</span>
                            </button>

                            <div className="post-url-row">
                                <input
                                    value={mediaUrl}
                                    onChange={(event) => setMediaUrl(event.target.value)}
                                    placeholder={`Paste ${getMediaNoun(expectedMediaType, 1)} URL`}
                                />
                                <button type="button" onClick={addMediaUrl} disabled={!mediaUrl.trim()}>
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            {mediaNotice && <span className="post-media-notice">{mediaNotice}</span>}

                            {postType === "post" && (
                                <div className="post-sample-grid">
                                    {samplePhotos.map((samplePhoto, index) => (
                                        <button
                                            key={samplePhoto}
                                            type="button"
                                            onClick={() => {
                                                setPhotos((currentPhotos) => [...currentPhotos, { src: samplePhoto, label: `Sample ${index + 1}`, type: "photo" }]);
                                                setActivePhotoIndex(photos.length);
                                                setMediaNotice("");
                                            }}
                                        >
                                            <img src={samplePhoto} alt="" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {postType === "reel" && (
                                <section className="post-clip-editor">
                                    <div className="post-clip-editor-heading">
                                        <SlidersHorizontal className="h-4 w-4" />
                                        <strong>Clip editor</strong>
                                    </div>
                                    <label>
                                        Trim
                                        <span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="55"
                                                value={clipStart}
                                                onChange={(event) => setClipStart(Math.min(Number(event.target.value), clipEnd - 1))}
                                            />
                                            <input
                                                type="range"
                                                min="1"
                                                max="60"
                                                value={clipEnd}
                                                onChange={(event) => setClipEnd(Math.max(Number(event.target.value), clipStart + 1))}
                                            />
                                        </span>
                                        <em>{clipStart}s - {clipEnd}s</em>
                                    </label>
                                    <label>
                                        Cover
                                        <input
                                            type="range"
                                            min={clipStart}
                                            max={clipEnd}
                                            value={clipCover}
                                            onChange={(event) => setClipCover(Number(event.target.value))}
                                        />
                                        <em>{clipCover}s</em>
                                    </label>
                                    <div className="post-speed-row" aria-label="Clip speed">
                                        {["0.5x", "1x", "1.5x", "2x"].map((speed) => (
                                            <button
                                                key={speed}
                                                type="button"
                                                className={clipSpeed === speed ? "active" : ""}
                                                onClick={() => setClipSpeed(speed)}
                                            >
                                                {speed}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </aside>
                    ) : stage === "details" ? (
                        <aside className="post-details-panel">
                            <div className="post-author-row">
                                <span>{authorName[0]}</span>
                                <div>
                                    <strong>{authorName}</strong>
                                    <small>{postType === "reel" ? "Reel" : "Post"} / {audience}</small>
                                </div>
                            </div>

                            <label className="post-caption-field">
                                <textarea
                                    value={caption}
                                    onChange={(event) => setCaption(event.target.value)}
                                    rows={7}
                                    placeholder="Write a caption..."
                                    maxLength={2200}
                                />
                                <span>{caption.length}/2200</span>
                            </label>

                            <label className="post-description-field">
                                <textarea
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    rows={3}
                                    placeholder="Add a description..."
                                    maxLength={600}
                                />
                                <span>{description.length}/600</span>
                            </label>

                            <div className="post-detail-list">
                                <label>
                                    <AtSign className="h-4 w-4" />
                                    <input
                                        value={tagText}
                                        onChange={(event) => setTagText(event.target.value)}
                                        placeholder="Tag people"
                                    />
                                </label>
                                <label>
                                    <MapPin className="h-4 w-4" />
                                    <input
                                        value={location}
                                        onChange={(event) => setLocation(event.target.value)}
                                        placeholder="Add location"
                                    />
                                </label>
                                <label>
                                    <Globe2 className="h-4 w-4" />
                                    <select value={audience} onChange={(event) => setAudience(event.target.value)}>
                                        <option>Friends</option>
                                        <option>Close friends</option>
                                        <option>Public</option>
                                    </select>
                                </label>
                                <label>
                                    <Music2 className="h-4 w-4" />
                                    <input
                                        value={musicTrack}
                                        onChange={(event) => setMusicTrack(event.target.value)}
                                        placeholder="Add music"
                                    />
                                </label>
                            </div>

                            <div className="post-ready-row">
                                <Check className="h-4 w-4" />
                                <span>{photos.length} {mediaPlural} / {musicTrack || "no music"}</span>
                            </div>
                        </aside>
                    ) : (
                        <aside className="post-workout-step">
                            <div className="post-workout-step-header">
                                <span><Dumbbell className="h-5 w-5" /></span>
                                <div>
                                    <strong>Workout slide</strong>
                                    <small>Added after your {mediaPlural}</small>
                                </div>
                            </div>

                            <label className="post-workout-attach">
                                <input
                                    type="checkbox"
                                    checked={includeWorkout}
                                    onChange={(event) => setIncludeWorkout(event.target.checked)}
                                />
                                <span>
                                    <strong>Add completed workout</strong>
                                    <small>Make it the last slide in the carousel</small>
                                </span>
                            </label>

                            {includeWorkout && (
                                <div className="post-workout-card">
                                    <input
                                        value={workout.title}
                                        onChange={(event) => setWorkout((currentWorkout) => ({ ...currentWorkout, title: event.target.value }))}
                                        placeholder="Workout title"
                                    />
                                    <div>
                                        <input
                                            value={workout.duration}
                                            onChange={(event) => setWorkout((currentWorkout) => ({ ...currentWorkout, duration: event.target.value }))}
                                            placeholder="Duration"
                                        />
                                        <input
                                            value={workout.volume}
                                            onChange={(event) => setWorkout((currentWorkout) => ({ ...currentWorkout, volume: event.target.value }))}
                                            placeholder="Volume"
                                        />
                                    </div>
                                    <textarea
                                        value={exerciseText}
                                        onChange={(event) => setExerciseText(event.target.value)}
                                        rows={5}
                                        placeholder="Bench press: 4 x 6 at 185 lb"
                                    />
                                </div>
                            )}

                            <div className="post-carousel-summary">
                                <strong>Carousel order</strong>
                                <ol>
                                    <li>
                                        <span>{photos.length} {mediaPlural}</span>
                                        <small>{postType === "reel" ? "Video carousel" : "Photo carousel"}</small>
                                    </li>
                                    {includeWorkout && (
                                        <li>
                                            <span>{workout.title || "Workout complete"}</span>
                                            <small>Final slide</small>
                                        </li>
                                    )}
                                </ol>
                            </div>

                            <div className="post-ready-row">
                                <Check className="h-4 w-4" />
                                <span>{photos.length + (includeWorkout ? 1 : 0)} slides ready</span>
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default PostComposer;
