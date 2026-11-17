import { useRef } from "react";
import { animate } from "animejs";
import { Button } from "../../components/ui/button";

const MagneticButton = ({ children, ...props }) => {
    const ref = useRef(null);

    const handlePointerMove = (event) => {
        const button = ref.current;
        if (!button) return;
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.14;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.22;
        animate(button, { translateX: x, translateY: y, duration: 220, ease: "outCubic" });
    };

    const reset = () => {
        if (!ref.current) return;
        animate(ref.current, { translateX: 0, translateY: 0, duration: 320, ease: "outElastic(1, .6)" });
    };

    return (
        <Button
            ref={ref}
            onPointerMove={handlePointerMove}
            onPointerLeave={reset}
            {...props}
        >
            {children}
        </Button>
    );
};

export default MagneticButton;
