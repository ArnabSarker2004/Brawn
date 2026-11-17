import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { cn } from "../../lib/utils";

const SpotlightCard = ({ className, children }) => {
    const ref = useRef(null);

    useEffect(() => {
        const card = ref.current;
        if (!card) return;

        animate(card, {
            opacity: [0, 1],
            translateY: [18, 0],
            duration: 650,
            ease: "outCubic",
        });
    }, []);

    return (
        <div
            ref={ref}
            className={cn("react-bits-spotlight", className)}
        >
            {children}
        </div>
    );
};

export default SpotlightCard;
