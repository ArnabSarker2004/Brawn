import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import BrawnLogo from "../../assets/Brawn_Logo.png";

const AnimatedBrawnMark = ({ compact = false }) => {
    const rootRef = useRef(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        animate(root.querySelector(".brawn-logo-card"), {
            translateX: [0, 9, 0, -7, 0],
            translateY: [0, -8, 2, -6, 0],
            rotate: [-1, 2.5, -2, 1.5, -1],
            scale: [1, 1.03, 0.99, 1.02, 1],
            duration: 1500,
            loop: true,
            ease: "inOutSine",
        });

        animate(root.querySelector(".brawn-logo-aura"), {
            scale: [0.94, 1.12, 0.94],
            opacity: [0.68, 0.26, 0.68],
            duration: 1800,
            loop: true,
            ease: "inOutSine",
        });

        animate(root.querySelector(".brawn-logo-ring"), {
            rotate: 360,
            duration: 5200,
            loop: true,
            ease: "linear",
        });

        animate(root.querySelectorAll(".brawn-logo-speed"), {
            translateX: [64, -64],
            scaleX: [0.55, 1],
            opacity: [0, 0.9, 0],
            delay: stagger(160),
            duration: 980,
            loop: true,
            ease: "linear",
        });
    }, []);

    return (
        <div ref={rootRef} className={compact ? "brawn-logo-motion compact" : "brawn-logo-motion"}>
            <span className="brawn-logo-aura" />
            <span className="brawn-logo-ring" />
            <span className="brawn-logo-speed speed-one" />
            <span className="brawn-logo-speed speed-two" />
            <span className="brawn-logo-speed speed-three" />
            <span className="brawn-logo-card">
                <img className="brawn-logo-outline" src={BrawnLogo} alt="" aria-hidden="true" />
                <img src={BrawnLogo} alt="Brawn running logo" />
            </span>
        </div>
    );
};

export default AnimatedBrawnMark;
