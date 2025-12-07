// Shared animation variants for consistency across dashboard components
import type { Variants, Transition } from "framer-motion";

// Spring configuration for natural motion
export const springTransition: Transition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
};

// Card entry animation
export const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

// Item entry animation (for list items)
export const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3, ease: "easeOut" }
    }
};

// Stagger container for parent elements
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        }
    }
};

// Fade in animation
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
};

// Scale animation for hover effects
export const scaleOnHover: Variants = {
    rest: { scale: 1 },
    hover: { scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 30 } }
};

// Slide up animation
export const slideUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

// Progress bar animation
export const progressVariants: Variants = {
    hidden: { scaleX: 0, originX: 0 },
    visible: {
        scaleX: 1,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};
