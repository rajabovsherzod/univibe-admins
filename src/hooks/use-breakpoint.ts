"use client";

import { useEffect, useState } from "react";

const screens = {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
};

/**
 * Checks whether a particular Tailwind CSS viewport size applies.
 *
 * @param size The size to check, which must either be included in Tailwind CSS's
 * list of default screen sizes, or added to the Tailwind CSS config file.
 *
 * @returns A boolean indicating whether the viewport size applies.
 */
export const useBreakpoint = (size: "sm" | "md" | "lg" | "xl" | "2xl") => {
    // Start with undefined to avoid hydration mismatches
    const [matches, setMatches] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        // Initial check on mount
        const breakpoint = window.matchMedia(`(min-width: ${screens[size]})`);
        setMatches(breakpoint.matches);

        // Listen for changes
        const handleChange = (value: MediaQueryListEvent) => setMatches(value.matches);
        breakpoint.addEventListener("change", handleChange);
        return () => breakpoint.removeEventListener("change", handleChange);
    }, [size]);

    // Return false until hydration is complete to guarantee matching server render
    return matches === undefined ? false : matches;
};
