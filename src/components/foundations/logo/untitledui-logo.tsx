"use client";

import type { HTMLAttributes } from "react";
import { cx } from "@/utils/cx";
import Image from "next/image";

export const UntitledLogo = (props: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div {...props} className={cx("flex items-center justify-start overflow-visible", props.className)}>
            <Image 
                src="/univibe-logo-new.svg" 
                alt="Univibe Logo" 
                width={160} 
                height={28} 
                className="h-full w-auto object-contain"
                priority
            />
        </div>
    );
};
