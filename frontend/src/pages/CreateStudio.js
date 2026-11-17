import {
    ArrowLeft,
    AtSign,
    Check,
    Clapperboard,
    ClipboardPaste,
    Copy,
    Crop,
    Dumbbell,
    FlipHorizontal,
    FlipVertical,
    Globe2,
    ImagePlus,
    Layers,
    MapPin,
    Music2,
    Palette,
    Pause,
    Play,
    Plus,
    RotateCcw,
    RotateCw,
    Scissors,
    Send,
    SlidersHorizontal,
    Type,
    Volume2,
    Wand2,
    X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocialPosts } from "../context/SocialPostsContext";

const samplePhotos = [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=80",
];

const defaultWorkout = {
    title: "Workout complete",
    duration: "46 min",
    volume: "12,840 lb",
    exercises: [
        { name: "Bench press", detail: "4 x 6 at 185 lb" },
        { name: "Incline DB press", detail: "3 x 10 at 60 lb" },
        { name: "Cable fly", detail: "3 x 12 at 35 lb" },
    ],
};

const defaultAdjustments = {
    exposure: 0,
    brilliance: 0,
    highlights: 0,
    shadows: 0,
    contrast: 0,
    brightness: 0,
    blackPoint: 0,
    saturation: 0,
    vibrance: 0,
    warmth: 0,
    tint: 0,
    sharpness: 0,
    definition: 0,
    noiseReduction: 0,
    vignette: 0,
    fade: 0,
    grain: 0,
    blur: 0,
};

const adjustmentControls = [
    ["exposure", "Exposure", -100, 100],
    ["brilliance", "Brilliance", -100, 100],
    ["highlights", "Highlights", -100, 100],
    ["shadows", "Shadows", -100, 100],
    ["contrast", "Contrast", -100, 100],
    ["brightness", "Brightness", -100, 100],
    ["blackPoint", "Black point", 0, 100],
    ["saturation", "Saturation", -100, 100],
    ["vibrance", "Vibrance", -100, 100],
    ["warmth", "Warmth", -100, 100],
    ["tint", "Tint", -100, 100],
    ["sharpness", "Sharpness", 0, 100],
    ["definition", "Definition", 0, 100],
    ["noiseReduction", "Noise reduction", 0, 100],
    ["vignette", "Vignette", 0, 100],
    ["fade", "Fade", 0, 100],
    ["grain", "Grain", 0, 100],
    ["blur", "Blur", 0, 20],
];

const filterPresets = [
    { id: "original", label: "Original", values: {} },
    { id: "vivid", label: "Vivid", values: { saturation: 22, contrast: 12, brilliance: 12 } },
    { id: "warm", label: "Warm", values: { warmth: 26, saturation: 10, highlights: -8 } },
    { id: "cool", label: "Cool", values: { warmth: -24, tint: -8, contrast: 8 } },
    { id: "dramatic", label: "Dramatic", values: { contrast: 28, shadows: -16, highlights: -12, blackPoint: 16 } },
    { id: "mono", label: "Mono", values: { saturation: -100, contrast: 18, brightness: 4 } },
];

const cropPresets = [
    { id: "square", label: "1:1", ratio: "1 / 1" },
    { id: "portrait", label: "4:5", ratio: "4 / 5" },
    { id: "story", label: "9:16", ratio: "9 / 16" },
    { id: "wide", label: "16:9", ratio: "16 / 9" },
];

const defaultCrop = { preset: "square", x: 50, y: 50, zoom: 100, rotation: 0, straighten: 0, flipX: false, flipY: false };

const splitTags = (value) =>
    value
        .split(/[, ]+/)
        .map((tag) => tag.replace(/^@/, "").trim())
        .filter(Boolean);

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);
const isVideoSource = (src = "") => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src);

const makeExerciseText = (exercises = []) =>
    exercises.map((exercise) => `${exercise.name}: ${exercise.detail}`).join("\n");

const parseExerciseText = (value) =>
    value
        .split("\n")
        .map((line) => {
            const [name, ...detailParts] = line.split(":");
            return { name: name?.trim(), detail: detailParts.join(":").trim() };
        })
        .filter((exercise) => exercise.name && exercise.detail);

const readMediaFile = (file, expectedType) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
            resolve({
                id: makeId("media"),
                src: reader.result,
                label: file.name.replace(/\.[^.]+$/, "") || "Training media",
                type: expectedType,
            });
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const buildPhotoFilter = (adjustments) => {
    const brightness = 100 + adjustments.exposure * 0.28 + adjustments.brightness * 0.38 + adjustments.brilliance * 0.18 + adjustments.shadows * 0.12;
    const contrast = 100 + adjustments.contrast * 0.5 + adjustments.blackPoint * 0.2 + adjustments.definition * 0.16;
    const saturation = 100 + adjustments.saturation * 0.7 + adjustments.vibrance * 0.45;
    const sepia = Math.max(0, adjustments.warmth) * 0.24;
    const hue = adjustments.tint * 0.35 - Math.min(0, adjustments.warmth) * 0.16;
    const grayscale = Math.max(0, -adjustments.saturation - 70);
    const blur = adjustments.blur * 0.08 + adjustments.noiseReduction * 0.01;

    return [
        `brightness(${clampValue(brightness, 35, 175)}%)`,
        `contrast(${clampValue(contrast, 45, 185)}%)`,
        `saturate(${clampValue(saturation, 0, 220)}%)`,
        `sepia(${clampValue(sepia, 0, 36)}%)`,
        `hue-rotate(${clampValue(hue, -45, 45)}deg)`,
        `grayscale(${clampValue(grayscale, 0, 100)}%)`,
        `blur(${clampValue(blur, 0, 1.8)}px)`,
    ].join(" ");
};

const makePhotoStyle = (adjustments, crop) => ({
    filter: buildPhotoFilter(adjustments),
    objectPosition: `${crop.x}% ${crop.y}%`,
    transform: `scale(${crop.zoom / 100}) rotate(${(crop.rotation || 0) + crop.straighten}deg) scaleX(${crop.flipX ? -1 : 1}) scaleY(${crop.flipY ? -1 : 1})`,
});

const getMediaTypeForMode = (mode) => (mode === "video" ? "video" : "photo");

const CreateStudio = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { createPost } = useSocialPosts();
    const fileInputRef = useRef(null);
    const timelineRef = useRef(null);
    const videoPreviewRef = useRef(null);
    const draggedMediaIdRef = useRef(null);
    const [mode, setMode] = useState("video");
    const [mediaItems, setMediaItems] = useState([]);
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [mediaUrl, setMediaUrl] = useState("");
    const [mediaNotice, setMediaNotice] = useState("");
    const [caption, setCaption] = useState("");
    const [description, setDescription] = useState("");
    const [tagText, setTagText] = useState("");
    const [location, setLocation] = useState("");
    const [audience, setAudience] = useState("Friends");
    const [musicTrack, setMusicTrack] = useState("");
    const [includeWorkout, setIncludeWorkout] = useState(false);
    const [workout, setWorkout] = useState(defaultWorkout);
    const [exerciseText, setExerciseText] = useState(makeExerciseText(defaultWorkout.exercises));
    const [adjustments, setAdjustments] = useState(defaultAdjustments);
    const [selectedFilter, setSelectedFilter] = useState("original");
    const [crop, setCrop] = useState(defaultCrop);
    const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
    const [playhead, setPlayhead] = useState(6);
    const [selectedClip, setSelectedClip] = useState({ kind: "video", trackId: "video-track-1", clipId: null });
    const [clipClipboard, setClipClipboard] = useState(null);
    const [videoTracks, setVideoTracks] = useState([
        { id: "video-track-1", name: "Video 1", clips: [] },
    ]);
    const [audioTracks, setAudioTracks] = useState([
        { id: "audio-track-1", name: "Music", clips: [{ id: "audio-bed", label: "Music bed", start: 0, end: 28, volume: 82 }] },
    ]);

    const expectedType = getMediaTypeForMode(mode);
    const activeMedia = mediaItems[activeMediaIndex] || null;
    const activeCropPreset = cropPresets.find((preset) => preset.id === crop.preset) || cropPresets[0];
    const activePhotoStyle = makePhotoStyle(adjustments, crop);
    const selectedVideoClip = videoTracks.flatMap((track) => track.clips.map((clip) => ({ ...clip, trackId: track.id }))).find((clip) => clip.id === selectedClip.clipId);
    const selectedAudioClip = audioTracks.flatMap((track) => track.clips.map((clip) => ({ ...clip, trackId: track.id }))).find((clip) => clip.id === selectedClip.clipId);
    const tags = useMemo(() => splitTags(tagText), [tagText]);
    const reelDuration = 60;
    const authorName = user ? user.charAt(0).toUpperCase() + user.slice(1) : "You";
    const canPublish = mediaItems.some((item) => item.type === expectedType && item.src);

    const appendMedia = (items) => {
        if (!items.length) return;

        setMediaItems((currentItems) => [...currentItems, ...items]);
        setActiveMediaIndex(mediaItems.length);
        setMediaNotice("");

        if (mode === "video") {
            setVideoTracks((currentTracks) => currentTracks.map((track, trackIndex) => {
                if (trackIndex !== 0) return track;

                const clips = items.map((item, index) => {
                    const start = clampValue((track.clips.length + index) * 10, 0, 48);
                    return {
                        id: makeId("clip"),
                        mediaId: item.id,
                        label: item.label || `Clip ${track.clips.length + index + 1}`,
                        start,
                        end: clampValue(start + 12, start + 1, reelDuration),
                        opacity: 100,
                    };
                });

                const nextClips = [...track.clips, ...clips];
                setSelectedClip({ kind: "video", trackId: track.id, clipId: clips[0]?.id || nextClips[0]?.id || null });
                return { ...track, clips: nextClips };
            }));
        }
    };

    const handleFiles = async (fileList) => {
        const files = Array.from(fileList || []);
        const acceptedFiles = files.filter((file) => (expectedType === "video" ? file.type.startsWith("video/") : file.type.startsWith("image/")));

        if (!acceptedFiles.length) {
            if (files.length) setMediaNotice(`This ${mode === "video" ? "reel" : "post"} only accepts ${expectedType === "video" ? "videos" : "photos"}.`);
            return;
        }

        const nextItems = await Promise.all(acceptedFiles.map((file) => readMediaFile(file, expectedType)));
        appendMedia(nextItems);
        if (files.length !== acceptedFiles.length) setMediaNotice(`Mixed media is blocked. This ${mode === "video" ? "reel" : "post"} only uses ${expectedType === "video" ? "videos" : "photos"}.`);
    };

    const addMediaUrl = () => {
        const nextUrl = mediaUrl.trim();
        if (!nextUrl) return;

        const nextType = isVideoSource(nextUrl) ? "video" : "photo";
        if (nextType !== expectedType) {
            setMediaNotice(`Switch to ${nextType === "video" ? "Video" : "Photo"} mode to add that media.`);
            return;
        }

        appendMedia([{ id: makeId("media"), src: nextUrl, label: `Media ${mediaItems.length + 1}`, type: expectedType }]);
        setMediaUrl("");
    };

    const switchMode = (nextMode) => {
        if (nextMode === mode) return;

        setMode(nextMode);
        setMediaItems([]);
        setActiveMediaIndex(0);
        setMediaNotice("");
        setSelectedClip({ kind: "video", trackId: "video-track-1", clipId: null });
        setVideoTracks([
            { id: "video-track-1", name: "Video 1", clips: [] },
        ]);
        setAudioTracks([
            { id: "audio-track-1", name: "Music", clips: [{ id: "audio-bed", label: "Music bed", start: 0, end: 28, volume: 82 }] },
        ]);
    };

    const getTimelineSecond = (clientX) => {
        const rect = timelineRef.current?.querySelector(".create-track-lane")?.getBoundingClientRect()
            || timelineRef.current?.getBoundingClientRect();
        if (!rect?.width) return 0;
        return Math.round(clampValue((clientX - rect.left) / rect.width, 0, 1) * reelDuration);
    };

    const updateClip = (kind, trackId, clipId, updater) => {
        const updateTrack = (track) => track.id === trackId
            ? { ...track, clips: track.clips.map((clip) => clip.id === clipId ? updater(clip) : clip) }
            : track;

        if (kind === "video") setVideoTracks((tracks) => tracks.map(updateTrack));
        if (kind === "audio") setAudioTracks((tracks) => tracks.map(updateTrack));
    };

    const startTimelineDrag = (kind, action, trackId, clipId, event) => {
        event.preventDefault();
        event.stopPropagation();

        const sourceClip = [...videoTracks, ...audioTracks].find((track) => track.id === trackId)?.clips.find((clip) => clip.id === clipId);
        const startX = event.clientX;
        const originalStart = sourceClip?.start || 0;
        const originalEnd = sourceClip?.end || 1;
        const originalDuration = Math.max(1, originalEnd - originalStart);

        const applyDrag = (clientX) => {
            const nextSecond = getTimelineSecond(clientX);

            if (action === "playhead") {
                setPlayhead(nextSecond);
                return;
            }

            if (action === "move") {
                const rect = timelineRef.current?.getBoundingClientRect();
                const deltaSeconds = rect?.width ? Math.round(((clientX - startX) / rect.width) * reelDuration) : 0;
                const nextStart = clampValue(originalStart + deltaSeconds, 0, reelDuration - originalDuration);
                updateClip(kind, trackId, clipId, (clip) => ({ ...clip, start: nextStart, end: nextStart + originalDuration }));
                return;
            }

            if (action === "start") {
                updateClip(kind, trackId, clipId, (clip) => ({ ...clip, start: clampValue(nextSecond, 0, clip.end - 1) }));
                return;
            }

            updateClip(kind, trackId, clipId, (clip) => ({ ...clip, end: clampValue(nextSecond, clip.start + 1, reelDuration) }));
        };

        applyDrag(event.clientX);

        const handleMove = (moveEvent) => {
            moveEvent.preventDefault();
            applyDrag(moveEvent.clientX);
        };

        const stopDrag = () => {
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("pointerup", stopDrag);
            window.removeEventListener("pointercancel", stopDrag);
        };

        window.addEventListener("pointermove", handleMove);
        window.addEventListener("pointerup", stopDrag);
        window.addEventListener("pointercancel", stopDrag);
    };

    const addVideoTrack = () => {
        setVideoTracks((tracks) => [...tracks, { id: makeId("video-track"), name: `Video ${tracks.length + 1}`, clips: [] }]);
    };

    const addAudioTrack = () => {
        setAudioTracks((tracks) => [...tracks, { id: makeId("audio-track"), name: `Audio ${tracks.length + 1}`, clips: [] }]);
    };

    const addMediaClipToTrack = (trackId, startSecond = playhead, mediaId = activeMedia?.id) => {
        const sourceMedia = mediaItems.find((item) => item.id === mediaId);
        if (!sourceMedia || sourceMedia.type !== "video") return;

        const start = clampValue(startSecond, 0, 48);
        const clip = {
            id: makeId("clip"),
            mediaId: sourceMedia.id,
            label: sourceMedia.label || "Clip",
            start,
            end: clampValue(start + 12, start + 1, reelDuration),
            opacity: 100,
        };

        setVideoTracks((tracks) => tracks.map((track) => track.id === trackId ? { ...track, clips: [...track.clips, clip] } : track));
        setSelectedClip({ kind: "video", trackId, clipId: clip.id });
        setActiveMediaIndex(Math.max(0, mediaItems.findIndex((item) => item.id === sourceMedia.id)));
    };

    const addActiveClipToTrack = (trackId) => {
        addMediaClipToTrack(trackId);
    };

    const addAudioClipToTrack = (trackId, startSecond = playhead) => {
        const start = clampValue(startSecond, 0, 50);
        const clip = {
            id: makeId("audio"),
            label: musicTrack || "Audio clip",
            start,
            end: clampValue(start + 10, start + 1, reelDuration),
            volume: 74,
        };

        setAudioTracks((tracks) => tracks.map((track) => track.id === trackId ? { ...track, clips: [...track.clips, clip] } : track));
        setSelectedClip({ kind: "audio", trackId, clipId: clip.id });
    };

    const addTextOverlay = () => {
        const start = clampValue(playhead, 0, 54);
        const clip = {
            id: makeId("text"),
            type: "text",
            label: "Text overlay",
            start,
            end: clampValue(start + 6, start + 1, reelDuration),
            opacity: 100,
        };

        const targetTrackId = videoTracks[0]?.id || "video-track-1";
        setVideoTracks((tracks) => tracks.map((track, index) => index === 0 ? { ...track, clips: [...track.clips, clip] } : track));
        setSelectedClip({ kind: "video", trackId: targetTrackId, clipId: clip.id });
    };

    const splitSelectedClip = () => {
        if (!selectedClip.clipId) return;

        const splitTracks = (tracks) => tracks.map((track) => {
            if (track.id !== selectedClip.trackId) return track;

            const clipIndex = track.clips.findIndex((clip) => clip.id === selectedClip.clipId);
            const clip = track.clips[clipIndex];
            if (!clip || clip.end - clip.start <= 1) return track;

            const splitPoint = playhead > clip.start && playhead < clip.end
                ? playhead
                : Math.round((clip.start + clip.end) / 2);
            const firstClip = { ...clip, id: makeId("clip"), end: splitPoint, label: `${clip.label} A` };
            const secondClip = { ...clip, id: makeId("clip"), start: splitPoint, label: `${clip.label} B` };
            const clips = [
                ...track.clips.slice(0, clipIndex),
                firstClip,
                secondClip,
                ...track.clips.slice(clipIndex + 1),
            ];
            setSelectedClip({ ...selectedClip, clipId: secondClip.id });
            return { ...track, clips };
        });

        if (selectedClip.kind === "video") setVideoTracks(splitTracks);
        if (selectedClip.kind === "audio") setAudioTracks(splitTracks);
    };

    const getSelectedClipInfo = () => {
        const tracks = selectedClip.kind === "audio" ? audioTracks : videoTracks;
        const track = tracks.find((timelineTrack) => timelineTrack.id === selectedClip.trackId);
        const clip = track?.clips.find((timelineClip) => timelineClip.id === selectedClip.clipId);
        return clip ? { kind: selectedClip.kind, trackId: selectedClip.trackId, clip } : null;
    };

    const copySelectedClip = () => {
        const selected = getSelectedClipInfo();
        if (!selected) return;
        setClipClipboard({
            kind: selected.kind,
            clip: { ...selected.clip },
        });
    };

    const removeSelectedClip = () => {
        if (!selectedClip.clipId) return;
        const clearSelectedTrack = (track) => track.id === selectedClip.trackId
            ? { ...track, clips: track.clips.filter((clip) => clip.id !== selectedClip.clipId) }
            : track;

        if (selectedClip.kind === "video") setVideoTracks((tracks) => tracks.map(clearSelectedTrack));
        if (selectedClip.kind === "audio") setAudioTracks((tracks) => tracks.map(clearSelectedTrack));
        setSelectedClip({ kind: "video", trackId: "video-track-1", clipId: null });
    };

    const cutSelectedClip = () => {
        const selected = getSelectedClipInfo();
        if (!selected) return;
        setClipClipboard({
            kind: selected.kind,
            clip: { ...selected.clip },
        });
        removeSelectedClip();
    };

    const pasteClipboardClip = () => {
        if (!clipClipboard) return;

        const targetTracks = clipClipboard.kind === "audio" ? audioTracks : videoTracks;
        const selectedTrackExists = selectedClip.kind === clipClipboard.kind && targetTracks.some((track) => track.id === selectedClip.trackId);
        const targetTrackId = selectedTrackExists ? selectedClip.trackId : targetTracks[0]?.id;
        if (!targetTrackId) return;

        const duration = Math.max(1, clipClipboard.clip.end - clipClipboard.clip.start);
        const start = clampValue(playhead, 0, reelDuration - duration);
        const pastedClip = {
            ...clipClipboard.clip,
            id: makeId(clipClipboard.kind === "audio" ? "audio" : clipClipboard.clip.type === "text" ? "text" : "clip"),
            start,
            end: start + duration,
        };

        const addPastedClip = (track) => track.id === targetTrackId
            ? { ...track, clips: [...track.clips, pastedClip] }
            : track;

        if (clipClipboard.kind === "audio") setAudioTracks((tracks) => tracks.map(addPastedClip));
        if (clipClipboard.kind === "video") setVideoTracks((tracks) => tracks.map(addPastedClip));
        setSelectedClip({ kind: clipClipboard.kind, trackId: targetTrackId, clipId: pastedClip.id });

        if (pastedClip.mediaId) {
            const mediaIndex = mediaItems.findIndex((item) => item.id === pastedClip.mediaId);
            if (mediaIndex >= 0) setActiveMediaIndex(mediaIndex);
        }
    };

    const togglePreviewPlayback = () => {
        const video = videoPreviewRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setIsPreviewPlaying(true);
            return;
        }

        video.pause();
        setIsPreviewPlaying(false);
    };

    const removeClip = () => {
        removeSelectedClip();
    };

    const applyFilterPreset = (preset) => {
        setSelectedFilter(preset.id);
        setAdjustments({ ...defaultAdjustments, ...preset.values });
    };

    const updateAdjustment = (key, value) => {
        setAdjustments((currentAdjustments) => ({ ...currentAdjustments, [key]: Number(value) }));
    };

    const updateCrop = (key, value) => {
        setCrop((currentCrop) => ({ ...currentCrop, [key]: value }));
    };

    const resetPhotoEdits = () => {
        setSelectedFilter("original");
        setAdjustments(defaultAdjustments);
        setCrop(defaultCrop);
    };

    const startPhotoPan = (event) => {
        if (mode !== "photo" || !activeMedia) return;

        event.preventDefault();
        const startX = event.clientX;
        const startY = event.clientY;
        const originalX = crop.x;
        const originalY = crop.y;
        const rect = event.currentTarget.getBoundingClientRect();

        const handleMove = (moveEvent) => {
            moveEvent.preventDefault();
            const deltaX = ((moveEvent.clientX - startX) / Math.max(rect.width, 1)) * 100;
            const deltaY = ((moveEvent.clientY - startY) / Math.max(rect.height, 1)) * 100;
            setCrop((currentCrop) => ({
                ...currentCrop,
                x: clampValue(originalX - deltaX, 0, 100),
                y: clampValue(originalY - deltaY, 0, 100),
            }));
        };

        const stopPan = () => {
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("pointerup", stopPan);
            window.removeEventListener("pointercancel", stopPan);
        };

        window.addEventListener("pointermove", handleMove);
        window.addEventListener("pointerup", stopPan);
        window.addEventListener("pointercancel", stopPan);
    };

    const handlePhotoWheel = (event) => {
        if (mode !== "photo" || !activeMedia) return;

        event.preventDefault();
        const zoomStep = event.deltaY < 0 ? 4 : -4;
        setCrop((currentCrop) => ({
            ...currentCrop,
            zoom: clampValue(currentCrop.zoom + zoomStep, 100, 180),
        }));
    };

    const publishPost = () => {
        if (!canPublish) return;

        const photos = mediaItems
            .filter((item) => item.type === expectedType && item.src)
            .map((item, index) => ({
                ...item,
                label: item.label || `${mode === "video" ? "Clip" : "Photo"} ${index + 1}`,
                edits: mode === "photo" ? { adjustments, crop, filter: selectedFilter } : null,
                style: mode === "photo" ? activePhotoStyle : null,
            }));

        createPost({
            authorName,
            handle: user || "you",
            caption,
            description,
            tags,
            location,
            audience,
            photos,
            includeWorkout,
            workout: { ...workout, exercises: parseExerciseText(exerciseText) },
            postType: mode === "video" ? "reel" : "post",
            music: musicTrack ? { title: musicTrack } : null,
            clip: mode === "video"
                ? { playhead, videoTracks, audioTracks, start: selectedVideoClip?.start ?? 0, end: selectedVideoClip?.end ?? 18, speed: "1x" }
                : null,
        });
        navigate("/dashboard");
    };

    const renderMediaPreview = () => {
        if (!activeMedia) {
            return (
                <div className="create-studio-empty">
                    {mode === "video" ? <Clapperboard className="h-10 w-10" /> : <ImagePlus className="h-10 w-10" />}
                    <strong>{mode === "video" ? "Add videos to start editing" : "Add photos to start editing"}</strong>
                </div>
            );
        }

        if (mode === "video") {
            return <video ref={videoPreviewRef} src={activeMedia.src} controls muted playsInline onEnded={() => setIsPreviewPlaying(false)} onPause={() => setIsPreviewPlaying(false)} onPlay={() => setIsPreviewPlaying(true)} />;
        }

        return <img src={activeMedia.src} alt={activeMedia.label || "Selected media"} style={activePhotoStyle} />;
    };

    const selectTimelineClip = (kind, trackId, clip) => {
        setSelectedClip({ kind, trackId, clipId: clip.id });
        if (clip.mediaId) {
            const mediaIndex = mediaItems.findIndex((item) => item.id === clip.mediaId);
            if (mediaIndex >= 0) setActiveMediaIndex(mediaIndex);
        }
    };

    const renderTimelineClip = (clip, trackId, kind) => {
        const isSelected = selectedClip.kind === kind && selectedClip.clipId === clip.id;
        const clipMedia = mediaItems.find((item) => item.id === clip.mediaId);
        const clipStart = clampValue((clip.start / reelDuration) * 100, 0, 100);
        const clipWidth = clampValue(((clip.end - clip.start) / reelDuration) * 100, 2, 100);

        return (
            <button
                key={clip.id}
                type="button"
                className={`create-timeline-clip ${kind} ${isSelected ? "active" : ""}`}
                style={{ "--clip-left": `${clipStart}%`, "--clip-width": `${clipWidth}%` }}
                onClick={() => selectTimelineClip(kind, trackId, clip)}
                onPointerDown={(event) => {
                    if (event.target.closest(".create-clip-handle")) return;
                    selectTimelineClip(kind, trackId, clip);
                    startTimelineDrag(kind, "move", trackId, clip.id, event);
                }}
            >
                {clip.type === "text" ? (
                    <span className="create-text-clip"><Type className="h-4 w-4" /></span>
                ) : kind === "video" && clipMedia?.src ? (
                    <video src={clipMedia.src} muted playsInline />
                ) : (
                    <span className="create-waveform" />
                )}
                <small>{clip.label}</small>
                <span
                    className="create-clip-handle start"
                    onPointerDown={(event) => startTimelineDrag(kind, "start", trackId, clip.id, event)}
                />
                <span
                    className="create-clip-handle end"
                    onPointerDown={(event) => startTimelineDrag(kind, "end", trackId, clip.id, event)}
                />
            </button>
        );
    };

    return (
        <div className={`create-studio-page create-studio-${mode}`}>
            <header className="create-studio-topbar">
                <Link to="/dashboard" className="create-studio-back">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Link>
                <div className="create-studio-mode" role="tablist" aria-label="Create mode">
                    <button type="button" className={mode === "video" ? "active" : ""} onClick={() => switchMode("video")}>
                        <Clapperboard className="h-4 w-4" />
                        Video
                    </button>
                    <button type="button" className={mode === "photo" ? "active" : ""} onClick={() => switchMode("photo")}>
                        <ImagePlus className="h-4 w-4" />
                        Photo
                    </button>
                </div>
                <button type="button" className="create-studio-publish" onClick={publishPost} disabled={!canPublish}>
                    <Send className="h-4 w-4" />
                    Share
                </button>
            </header>

            <div className="create-studio-shell">
                <aside className="create-studio-rail">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={mode === "video" ? "video/*" : "image/*"}
                        multiple
                        hidden
                        onChange={(event) => {
                            handleFiles(event.target.files);
                            event.target.value = "";
                        }}
                    />
                    <button type="button" className="create-upload-tile" onClick={() => fileInputRef.current?.click()}>
                        {mode === "video" ? <Clapperboard className="h-6 w-6" /> : <ImagePlus className="h-6 w-6" />}
                        <span>{mode === "video" ? "Upload videos" : "Upload photos"}</span>
                    </button>
                    <div className="create-url-row">
                        <input
                            value={mediaUrl}
                            onChange={(event) => setMediaUrl(event.target.value)}
                            placeholder={mode === "video" ? "Paste video URL" : "Paste image URL"}
                        />
                        <button type="button" onClick={addMediaUrl} disabled={!mediaUrl.trim()}>
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    {mediaNotice && <p className="create-media-notice">{mediaNotice}</p>}

                    {mode === "photo" && (
                        <div className="create-sample-grid">
                            {samplePhotos.map((samplePhoto, index) => (
                                <button
                                    key={samplePhoto}
                                    type="button"
                                    onClick={() => appendMedia([{ id: makeId("media"), src: samplePhoto, label: `Sample ${index + 1}`, type: "photo" }])}
                                >
                                    <img src={samplePhoto} alt="" />
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="create-media-list" aria-label="Imported media">
                        {mediaItems.map((item, index) => (
                            <button
                                key={item.id}
                                type="button"
                                draggable={mode === "video" && item.type === "video"}
                                className={index === activeMediaIndex ? "active" : ""}
                                onClick={() => setActiveMediaIndex(index)}
                                onDragStart={(event) => {
                                    draggedMediaIdRef.current = item.id;
                                    event.dataTransfer.setData("text/plain", item.id);
                                    event.dataTransfer.effectAllowed = "copy";
                                }}
                            >
                                {item.type === "video" ? <video src={item.src} muted playsInline /> : <img src={item.src} alt="" />}
                                <span>{index + 1}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                <main className="create-studio-main">
                    <section className="create-preview-panel">
                        <div className="create-preview-toolbar">
                            <div>
                                <strong>{mode === "video" ? "Video editor" : "Photo editor"}</strong>
                                <span>{mode === "video" ? "Multi-track timeline" : `${selectedFilter} / ${activeCropPreset.label}`}</span>
                            </div>
                            <div>
                                {mode === "video" ? (
                                    <>
                                        <button type="button" onClick={togglePreviewPlayback} aria-label={isPreviewPlaying ? "Pause preview" : "Play preview"} title={isPreviewPlaying ? "Pause" : "Play"}>
                                            {isPreviewPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                        </button>
                                        <button type="button" onClick={splitSelectedClip} disabled={!selectedClip.clipId} aria-label="Split selected clip" title="Split at playhead"><Scissors className="h-4 w-4" /></button>
                                        <button type="button" onClick={addTextOverlay} aria-label="Add text overlay" title="Add text"><Type className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => addAudioClipToTrack(audioTracks[0]?.id || "audio-track-1")} aria-label="Add audio clip" title="Add audio"><Volume2 className="h-4 w-4" /></button>
                                    </>
                                ) : (
                                    <>
                                        <button type="button" onClick={() => updateCrop("rotation", ((crop.rotation || 0) - 90) % 360)}><RotateCcw className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => updateCrop("rotation", ((crop.rotation || 0) + 90) % 360)}><RotateCw className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => updateCrop("flipX", !crop.flipX)}><FlipHorizontal className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => updateCrop("flipY", !crop.flipY)}><FlipVertical className="h-4 w-4" /></button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div
                            className={`create-preview-frame ${mode === "video" ? "is-video" : "is-photo"}`}
                            style={mode === "photo" ? { aspectRatio: activeCropPreset.ratio } : undefined}
                            onPointerDown={mode === "photo" ? startPhotoPan : undefined}
                            onWheel={mode === "photo" ? handlePhotoWheel : undefined}
                        >
                            {renderMediaPreview()}
                            {mode === "photo" && adjustments.vignette > 0 && (
                                <span className="create-vignette" style={{ opacity: adjustments.vignette / 120 }} />
                            )}
                            {mode === "photo" && adjustments.grain > 0 && (
                                <span className="create-grain" style={{ opacity: adjustments.grain / 160 }} />
                            )}
                        </div>
                    </section>

                    {mode === "video" ? (
                        <section className="create-timeline" ref={timelineRef}>
                            <div className="create-timeline-header">
                                <div>
                                    <Layers className="h-4 w-4" />
                                    <strong>{videoTracks.length} video tracks / {audioTracks.length} audio tracks</strong>
                                </div>
                                <div className="create-edit-toolbar" aria-label="Timeline edit tools">
                                    <button type="button" onClick={splitSelectedClip} disabled={!selectedClip.clipId} title="Snip at playhead">
                                        <Scissors className="h-4 w-4" />
                                        Snip
                                    </button>
                                    <button type="button" onClick={cutSelectedClip} disabled={!selectedClip.clipId} title="Cut selected clip">
                                        <X className="h-4 w-4" />
                                        Cut
                                    </button>
                                    <button type="button" onClick={copySelectedClip} disabled={!selectedClip.clipId} title="Copy selected clip">
                                        <Copy className="h-4 w-4" />
                                        Copy
                                    </button>
                                    <button type="button" onClick={pasteClipboardClip} disabled={!clipClipboard} title="Paste at playhead">
                                        <ClipboardPaste className="h-4 w-4" />
                                        Paste
                                    </button>
                                </div>
                            </div>
                            <div
                                className="create-timeline-ruler"
                                style={{ "--playhead": `${(playhead / reelDuration) * 100}%` }}
                            >
                                <span className="create-ruler-track-label">{playhead}s</span>
                                <div
                                    className="create-ruler-scale"
                                    onPointerDown={(event) => startTimelineDrag("video", "playhead", null, null, event)}
                                >
                                    {[0, 10, 20, 30, 40, 50, 60].map((second) => <span key={second}>{second}s</span>)}
                                    <button
                                        type="button"
                                        className="create-ruler-playhead"
                                        onPointerDown={(event) => startTimelineDrag("video", "playhead", null, null, event)}
                                        aria-label="Drag timeline playhead"
                                    />
                                </div>
                            </div>
                            <div className="create-track-stack" style={{ "--playhead": `${(playhead / reelDuration) * 100}%` }}>
                                <button
                                    type="button"
                                    className="create-track-row create-ghost-track video"
                                    onClick={addVideoTrack}
                                    aria-label="Add video track"
                                >
                                    <span className="create-track-label create-ghost-track-label">
                                        <Clapperboard className="h-4 w-4" />
                                        <span>Video {videoTracks.length + 1}</span>
                                        <span className="create-ghost-track-icon"><Plus className="h-3 w-3" /></span>
                                    </span>
                                    <span className="create-track-lane create-ghost-track-lane">
                                        <span><Plus className="h-4 w-4" /> Add video track</span>
                                    </span>
                                </button>
                                {videoTracks.map((track) => (
                                    <div key={track.id} className="create-track-row video">
                                        <div className="create-track-label">
                                            <Clapperboard className="h-4 w-4" />
                                            <span>{track.name}</span>
                                            <button type="button" onClick={() => addActiveClipToTrack(track.id)}><Plus className="h-3 w-3" /></button>
                                        </div>
                                        <div
                                            className="create-track-lane"
                                            onPointerDown={(event) => {
                                                if (event.target.closest(".create-timeline-clip")) return;
                                                setPlayhead(getTimelineSecond(event.clientX));
                                            }}
                                            onDoubleClick={(event) => addMediaClipToTrack(track.id, getTimelineSecond(event.clientX))}
                                            onDragOver={(event) => {
                                                event.preventDefault();
                                                event.dataTransfer.dropEffect = "copy";
                                            }}
                                            onDrop={(event) => {
                                                event.preventDefault();
                                                const mediaId = event.dataTransfer.getData("text/plain") || draggedMediaIdRef.current;
                                                addMediaClipToTrack(track.id, getTimelineSecond(event.clientX), mediaId);
                                                draggedMediaIdRef.current = null;
                                            }}
                                        >
                                            {track.clips.map((clip) => renderTimelineClip(clip, track.id, "video"))}
                                        </div>
                                    </div>
                                ))}
                                {audioTracks.map((track) => (
                                    <div key={track.id} className="create-track-row audio">
                                        <div className="create-track-label">
                                            <Music2 className="h-4 w-4" />
                                            <span>{track.name}</span>
                                            <button type="button" onClick={() => addAudioClipToTrack(track.id)}><Plus className="h-3 w-3" /></button>
                                        </div>
                                        <div
                                            className="create-track-lane"
                                            onPointerDown={(event) => {
                                                if (event.target.closest(".create-timeline-clip")) return;
                                                setPlayhead(getTimelineSecond(event.clientX));
                                            }}
                                            onDoubleClick={(event) => addAudioClipToTrack(track.id, getTimelineSecond(event.clientX))}
                                        >
                                            {track.clips.map((clip) => renderTimelineClip(clip, track.id, "audio"))}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="create-track-row create-ghost-track audio"
                                    onClick={addAudioTrack}
                                    aria-label="Add audio track"
                                >
                                    <span className="create-track-label create-ghost-track-label">
                                        <Music2 className="h-4 w-4" />
                                        <span>Audio {audioTracks.length + 1}</span>
                                        <span className="create-ghost-track-icon"><Plus className="h-3 w-3" /></span>
                                    </span>
                                    <span className="create-track-lane create-ghost-track-lane">
                                        <span><Plus className="h-4 w-4" /> Add audio track</span>
                                    </span>
                                </button>
                            </div>
                        </section>
                    ) : (
                        <section className="create-photo-tools">
                            <div className="create-filter-strip">
                                {filterPresets.map((preset) => (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        className={selectedFilter === preset.id ? "active" : ""}
                                        onClick={() => applyFilterPreset(preset)}
                                    >
                                        <span style={{ filter: buildPhotoFilter({ ...defaultAdjustments, ...preset.values }) }} />
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                            <div className="create-crop-strip">
                                {cropPresets.map((preset) => (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        className={crop.preset === preset.id ? "active" : ""}
                                        onClick={() => updateCrop("preset", preset.id)}
                                    >
                                        <Crop className="h-4 w-4" />
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <aside className="create-studio-inspector">
                    {mode === "video" ? (
                        <section className="create-inspector-card">
                            <div className="create-inspector-heading">
                                <SlidersHorizontal className="h-4 w-4" />
                                <strong>{selectedClip.kind === "audio" ? "Audio clip" : "Video clip"}</strong>
                                {selectedClip.clipId && <button type="button" onClick={removeClip}><X className="h-4 w-4" /></button>}
                            </div>
                            {selectedClip.clipId ? (
                                <>
                                    <p className="create-selection-meta">{(selectedVideoClip || selectedAudioClip)?.label || "Selected clip"}</p>
                                    <label className="create-range-field">
                                        <span>Start <b>{(selectedVideoClip || selectedAudioClip)?.start || 0}s</b></span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="59"
                                            value={(selectedVideoClip || selectedAudioClip)?.start || 0}
                                            onChange={(event) => updateClip(selectedClip.kind, selectedClip.trackId, selectedClip.clipId, (clip) => ({ ...clip, start: clampValue(Number(event.target.value), 0, clip.end - 1) }))}
                                        />
                                    </label>
                                    <label className="create-range-field">
                                        <span>End <b>{(selectedVideoClip || selectedAudioClip)?.end || 1}s</b></span>
                                        <input
                                            type="range"
                                            min="1"
                                            max="60"
                                            value={(selectedVideoClip || selectedAudioClip)?.end || 1}
                                            onChange={(event) => updateClip(selectedClip.kind, selectedClip.trackId, selectedClip.clipId, (clip) => ({ ...clip, end: clampValue(Number(event.target.value), clip.start + 1, reelDuration) }))}
                                        />
                                    </label>
                                    {selectedClip.kind === "audio" ? (
                                        <label className="create-range-field">
                                            <span>Volume <b>{selectedAudioClip?.volume || 0}%</b></span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={selectedAudioClip?.volume || 0}
                                                onChange={(event) => updateClip("audio", selectedClip.trackId, selectedClip.clipId, (clip) => ({ ...clip, volume: Number(event.target.value) }))}
                                            />
                                        </label>
                                    ) : (
                                        <label className="create-range-field">
                                            <span>Opacity <b>{selectedVideoClip?.opacity || 100}%</b></span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={selectedVideoClip?.opacity || 100}
                                                onChange={(event) => updateClip("video", selectedClip.trackId, selectedClip.clipId, (clip) => ({ ...clip, opacity: Number(event.target.value) }))}
                                            />
                                        </label>
                                    )}
                                </>
                            ) : (
                                <p>Select a clip on the timeline.</p>
                            )}
                        </section>
                    ) : (
                        <section className="create-inspector-card">
                            <div className="create-inspector-heading">
                                <Wand2 className="h-4 w-4" />
                                <strong>Adjust</strong>
                                <button type="button" onClick={resetPhotoEdits}>Reset</button>
                            </div>
                            <div className="create-adjustment-list">
                                {adjustmentControls.map(([key, label, min, max]) => (
                                    <label key={key}>
                                        <span>{label}<b>{adjustments[key]}</b></span>
                                        <input
                                            type="range"
                                            min={min}
                                            max={max}
                                            value={adjustments[key]}
                                            onChange={(event) => updateAdjustment(key, event.target.value)}
                                        />
                                    </label>
                                ))}
                            </div>
                            <div className="create-crop-controls">
                                <label className="create-range-field">
                                    <span>Crop X <b>{crop.x}</b></span>
                                    <input type="range" min="0" max="100" value={crop.x} onChange={(event) => updateCrop("x", Number(event.target.value))} />
                                </label>
                                <label className="create-range-field">
                                    <span>Crop Y <b>{crop.y}</b></span>
                                    <input type="range" min="0" max="100" value={crop.y} onChange={(event) => updateCrop("y", Number(event.target.value))} />
                                </label>
                                <label className="create-range-field">
                                    <span>Zoom <b>{crop.zoom}%</b></span>
                                    <input type="range" min="100" max="180" value={crop.zoom} onChange={(event) => updateCrop("zoom", Number(event.target.value))} />
                                </label>
                                <label className="create-range-field">
                                    <span>Straighten <b>{crop.straighten}deg</b></span>
                                    <input type="range" min="-45" max="45" value={crop.straighten} onChange={(event) => updateCrop("straighten", Number(event.target.value))} />
                                </label>
                            </div>
                        </section>
                    )}

                    <section className="create-inspector-card">
                        <div className="create-inspector-heading">
                            <Palette className="h-4 w-4" />
                            <strong>Post</strong>
                            {canPublish && <Check className="h-4 w-4" />}
                        </div>
                        <textarea value={caption} onChange={(event) => setCaption(event.target.value)} rows={4} maxLength={2200} placeholder="Write a caption..." />
                        <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={600} placeholder="Add a description..." />
                        <label className="create-inline-field"><AtSign className="h-4 w-4" /><input value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="Tag people" /></label>
                        <label className="create-inline-field"><MapPin className="h-4 w-4" /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Add location" /></label>
                        <label className="create-inline-field"><Globe2 className="h-4 w-4" /><select value={audience} onChange={(event) => setAudience(event.target.value)}><option>Friends</option><option>Close friends</option><option>Public</option></select></label>
                        <label className="create-inline-field"><Music2 className="h-4 w-4" /><input value={musicTrack} onChange={(event) => setMusicTrack(event.target.value)} placeholder="Music or sound" /></label>
                    </section>

                    <section className="create-inspector-card">
                        <label className="create-workout-toggle">
                            <input type="checkbox" checked={includeWorkout} onChange={(event) => setIncludeWorkout(event.target.checked)} />
                            <Dumbbell className="h-4 w-4" />
                            <span>Workout as final slide</span>
                        </label>
                        {includeWorkout && (
                            <div className="create-workout-fields">
                                <input value={workout.title} onChange={(event) => setWorkout((currentWorkout) => ({ ...currentWorkout, title: event.target.value }))} placeholder="Workout title" />
                                <div>
                                    <input value={workout.duration} onChange={(event) => setWorkout((currentWorkout) => ({ ...currentWorkout, duration: event.target.value }))} placeholder="Duration" />
                                    <input value={workout.volume} onChange={(event) => setWorkout((currentWorkout) => ({ ...currentWorkout, volume: event.target.value }))} placeholder="Volume" />
                                </div>
                                <textarea value={exerciseText} onChange={(event) => setExerciseText(event.target.value)} rows={4} placeholder="Bench press: 4 x 6 at 185 lb" />
                            </div>
                        )}
                    </section>
                </aside>
            </div>
        </div>
    );
};

export default CreateStudio;
