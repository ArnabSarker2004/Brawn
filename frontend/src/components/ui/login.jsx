import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { animate, stagger } from "animejs";
import {
    ArrowRight,
    Check,
    Dumbbell,
    Eye,
    EyeOff,
    Flame,
    Github,
    HeartPulse,
    Loader2,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Timer,
    Trophy,
    UserRound,
    UsersRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AnimatedBrawnMark from "../../custom-components/ReactBits/AnimatedBrawnMark";
import { cn } from "../../lib/utils";

const URL =
    process.env.NODE_ENV === "production"
        ? "https://brawn-tedx.onrender.com"
        : "http://localhost:4000";

const strengthRules = [
    { label: "8+ chars", test: (value) => value.length >= 8 },
    { label: "Number", test: (value) => /\d/.test(value) },
    { label: "Letter", test: (value) => /[a-z]/i.test(value) },
];

const authProviders = [
    { label: "Google", icon: "google", className: "provider-google" },
    { label: "Apple ID", icon: "apple", className: "provider-apple" },
    { label: "GitHub", icon: Github, className: "provider-github" },
];

const featureSlides = [
    {
        type: "Strength",
        icon: Flame,
        title: "Build routines that actually stick.",
        copy: "Log lifts, sets, reps, and streaks in a flow made for gym days.",
        chips: ["Push", "Pull", "Legs"],
    },
    {
        type: "Cardio",
        icon: HeartPulse,
        title: "Track the sessions between the big lifts.",
        copy: "Runs, intervals, recovery work, and anything that keeps you moving.",
        chips: ["HIIT", "Running", "Cycling"],
    },
    {
        type: "Progress",
        icon: Trophy,
        title: "See your momentum without digging.",
        copy: "Watch consistency, workload, and personal wins come together over time.",
        chips: ["Streaks", "PRs", "Goals"],
    },
    {
        type: "Social",
        icon: UsersRound,
        title: "Share the work when you are ready.",
        copy: "Built with future clips, friends, and fitness-feed moments in mind.",
        chips: ["Friends", "Clips", "Challenges"],
    },
];

const iconLanes = [
    [Dumbbell, Timer, HeartPulse, Flame, Trophy, UsersRound],
    [HeartPulse, Trophy, Dumbbell, Timer, Flame, UserRound],
    [Timer, Flame, UsersRound, HeartPulse, Dumbbell, Trophy],
    [Trophy, Dumbbell, Timer, UserRound, HeartPulse, Flame],
];

const ProviderIcon = ({ provider }) => {
    if (provider.icon === "google") {
        return <span className="google-icon">G</span>;
    }

    if (provider.icon === "apple") {
        return (
            <svg className="apple-id-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.36 12.74c-.02-2.28 1.87-3.38 1.96-3.43-1.06-1.55-2.71-1.76-3.3-1.78-1.41-.14-2.75.83-3.46.83-.72 0-1.83-.81-3-.79-1.55.02-2.98.9-3.78 2.29-1.61 2.79-.41 6.93 1.16 9.19.77 1.11 1.68 2.35 2.88 2.3 1.16-.05 1.59-.75 2.99-.75 1.39 0 1.79.75 3.01.73 1.24-.02 2.03-1.13 2.79-2.24.88-1.29 1.25-2.54 1.27-2.6-.03-.01-2.49-.96-2.52-3.75ZM15.1 6.04c.63-.76 1.06-1.82.94-2.88-.91.04-2.01.61-2.66 1.37-.58.67-1.09 1.75-.96 2.78 1.02.08 2.05-.52 2.68-1.27Z" />
            </svg>
        );
    }

    const Icon = provider.icon;
    return <Icon className="h-5 w-5" />;
};

const AuthField = ({
    autoComplete,
    icon: Icon,
    id,
    label,
    name,
    onChange,
    placeholder,
    required = true,
    rightSlot,
    type = "text",
    value,
}) => (
    <label className="auth-field" htmlFor={id}>
        <span className="auth-field-label">{label}</span>
        <span className="auth-field-control">
            <Icon className="auth-field-icon" />
            <input
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required={required}
            />
            {rightSlot}
        </span>
    </label>
);

const FitnessIconBackground = () => (
    <div className="auth-icon-lanes" aria-hidden="true">
        {iconLanes.map((lane, laneIndex) => (
            <div
                key={laneIndex}
                className={cn("auth-icon-lane", laneIndex % 2 === 1 && "reverse")}
                style={{ "--lane-delay": `${laneIndex * -7}s` }}
            >
                <div className="auth-icon-track">
                    {[0, 1].map((groupIndex) => (
                        <div className="auth-icon-group" key={groupIndex}>
                            {lane.map((Icon, iconIndex) => (
                                <span key={`${groupIndex}-${iconIndex}`} className="auth-floating-icon">
                                    <Icon className="h-5 w-5" />
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

export function Login() {
    const navigate = useNavigate();
    const rootRef = useRef(null);
    const { verify, login } = useAuth();
    const [mode, setMode] = useState("Sign In");
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("idle");
    const [showPassword, setShowPassword] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const slideRef = useRef(null);
    const { username, password } = formData;

    const passwordScore = useMemo(
        () => strengthRules.filter((rule) => rule.test(password)).length,
        [password]
    );

    useEffect(() => {
        const targets = rootRef.current?.querySelectorAll(".auth-reveal");
        if (!targets?.length) return;
        animate(targets, {
            opacity: [0, 1],
            translateY: [14, 0],
            delay: stagger(80),
            duration: 560,
            ease: "outCubic",
        });
    }, []);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setActiveSlide((current) => {
                const next = Math.floor(Math.random() * featureSlides.length);
                return next === current ? (current + 1) % featureSlides.length : next;
            });
        }, 3800);

        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!slideRef.current) return;
        animate(slideRef.current, {
            opacity: [0, 1],
            translateX: [28, 0],
            duration: 520,
            ease: "outCubic",
        });
    }, [activeSlide]);

    const switchMode = (nextMode) => {
        setMode(nextMode);
        setMessage("");
        setStatus("idle");
    };

    const onChange = (e) => {
        setMessage("");
        setStatus("idle");
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onProviderAuth = () => {
        setMessage("");
        setStatus("idle");
    };

    const completeAuth = async (successMessage) => {
        setMessage(successMessage);
        const verified = await verify();
        login(username);
        if (verified || successMessage.includes("created")) {
            navigate("/dashboard");
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");
        const endpoint = mode === "Sign In" ? "login" : "register";
        const payload =
            mode === "Sign In"
                ? { username, password }
                : { username, password, MemberSince: new Date().toISOString() };

        try {
            await axios.post(`${URL}/api/auth/${endpoint}`, payload, {
                withCredentials: true,
            });
            setStatus("success");
            await completeAuth(
                mode === "Sign In"
                    ? "Welcome back. Loading your dashboard..."
                    : "Account created. Preparing your workspace..."
            );
        } catch (err) {
            const serverMessage = err.response?.data?.message || err.response?.data?.msg;
            const networkMessage =
                err.code === "ERR_NETWORK"
                    ? "Brawn cannot reach the server right now. Start the backend and make sure MongoDB is connected."
                    : null;
            setStatus("error");
            setMessage(
                networkMessage ||
                    serverMessage ||
                    (mode === "Sign In"
                        ? "We could not sign you in with those credentials."
                        : "We could not create that account. Try a different username.")
            );
        }
    };

    const isLoading = status === "loading";
    const isSignIn = mode === "Sign In";
    const currentSlide = featureSlides[activeSlide];
    const CurrentSlideIcon = currentSlide.icon;

    return (
        <div ref={rootRef} className="auth-shell h-screen overflow-hidden">
            <section className="grid h-screen lg:grid-cols-[1.02fr_0.98fr]">
                <div className="relative hidden bg-ink px-8 pt-7 pb-10 text-white lg:flex lg:flex-col">
                    <div className="auth-reveal">
                        <p className="text-xs uppercase tracking-[0.32em] text-emerald-200">Brawn</p>
                        <h1 className="text-lg font-semibold">Train. Track. Share.</h1>
                    </div>

                    <div className="auth-reveal flex flex-1 flex-col items-center justify-center text-center">
                        <AnimatedBrawnMark />
                        <p className="max-w-xl text-sm font-medium uppercase tracking-[0.32em] text-emerald-200">Your fitness hub</p>
                        <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight">
                            Record the work. Keep the energy.
                        </h2>
                        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
                            From lifting days to quick cardio hits, Brawn keeps your progress easy to capture and fun to come back to.
                        </p>
                    </div>

                    <div className="auth-reveal auth-feature-carousel">
                        <div ref={slideRef} key={currentSlide.title} className="auth-feature-slide">
                            <span className="auth-feature-icon">
                                <CurrentSlideIcon className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="auth-feature-type">{currentSlide.type}</p>
                                <h3>{currentSlide.title}</h3>
                                <p>{currentSlide.copy}</p>
                                <div className="auth-feature-chips">
                                    {currentSlide.chips.map((chip) => (
                                        <span key={chip}>{chip}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="auth-feature-dots">
                            {featureSlides.map((slide, index) => (
                                <button
                                    key={slide.title}
                                    type="button"
                                    aria-label={`Show ${slide.type}`}
                                    className={cn(index === activeSlide && "active")}
                                    onClick={() => setActiveSlide(index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="auth-form-side flex h-screen items-center justify-center overflow-hidden px-4 py-4 sm:px-8">
                    <FitnessIconBackground />
                    <div className="auth-reveal w-full max-w-[480px]">
                        <div className="mb-4 flex items-center gap-3 lg:hidden">
                            <AnimatedBrawnMark compact />
                            <div>
                                <p className="text-xs uppercase tracking-[0.24em] text-primary">Brawn</p>
                                <h1 className="text-base font-semibold">Training Command Center</h1>
                            </div>
                        </div>

                        <div className="auth-panel">
                            <div className="auth-panel-header">
                                <div>
                                    <p className="auth-eyebrow">
                                        <ShieldCheck className="h-4 w-4" />
                                        Brawn access
                                    </p>
                                    <h2>{isSignIn ? "Welcome back" : "Create your account"}</h2>
                                    <p>
                                        {isSignIn
                                            ? "Jump back into your workouts."
                                            : "Start tracking your training today."}
                                    </p>
                                </div>
                                <span className="auth-header-icon">
                                    <Mail className="h-5 w-5" />
                                </span>
                            </div>

                            <div className="auth-mode-switch" role="tablist" aria-label="Authentication mode">
                                {["Sign In", "Sign Up"].map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        role="tab"
                                        aria-selected={mode === option}
                                        className={cn(mode === option && "active")}
                                        onClick={() => switchMode(option)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>

                            <div className="auth-provider-grid">
                                {authProviders.map((provider) => (
                                    <button
                                        key={provider.label}
                                        type="button"
                                        onClick={onProviderAuth}
                                        className={cn("auth-provider-button", provider.className)}
                                        aria-label={`${mode} with ${provider.label}`}
                                    >
                                        <ProviderIcon provider={provider} />
                                        <span>{provider.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="auth-divider">
                                <span />
                                <p>{isSignIn ? "or use your Brawn password" : "or create credentials"}</p>
                                <span />
                            </div>

                            <form onSubmit={onSubmit} className="auth-form">
                                <AuthField
                                    id={`${mode}-username`}
                                    label="Username"
                                    name="username"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={onChange}
                                    autoComplete="username"
                                    icon={UserRound}
                                />

                                <AuthField
                                    id={`${mode}-password`}
                                    label="Password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={onChange}
                                    autoComplete={isSignIn ? "current-password" : "new-password"}
                                    icon={LockKeyhole}
                                    type={showPassword ? "text" : "password"}
                                    rightSlot={
                                        <button
                                            type="button"
                                            className="auth-password-toggle"
                                            onClick={() => setShowPassword((value) => !value)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    }
                                />

                                <div className="auth-form-row">
                                    {isSignIn ? (
                                        <>
                                            <label className="auth-check">
                                                <input type="checkbox" />
                                                <span>Remember me</span>
                                            </label>
                                            <button
                                                type="button"
                                                className="auth-text-button"
                                                onClick={() => setMessage("Password reset needs a backend route before it can send recovery emails.")}
                                            >
                                                Forgot password?
                                            </button>
                                        </>
                                    ) : (
                                        <div className="auth-strength">
                                            <div className="auth-strength-bars">
                                                {[0, 1, 2].map((item) => (
                                                    <span key={item} className={cn(passwordScore > item && "active")} />
                                                ))}
                                            </div>
                                            <div className="auth-strength-rules">
                                                {strengthRules.map((rule) => (
                                                    <p key={rule.label} className={cn(rule.test(password) && "active")}>
                                                        <Check className="h-3.5 w-3.5" />
                                                        {rule.label}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {message && (
                                    <p className={cn("auth-message", status === "error" ? "error" : "success")}>
                                        {message}
                                    </p>
                                )}

                                <button type="submit" className="auth-submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            {isSignIn ? "Enter dashboard" : "Create Brawn account"}
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>

                                <p className="auth-footnote">
                                    Your workouts stay private until you choose to share.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
