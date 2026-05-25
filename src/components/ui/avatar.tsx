"use client";
import * as React from "react";
import { cn, initials } from "@/lib/utils";

export function Avatar({
  src,
  name,
  size = 40,
  className,
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const [errored, setErrored] = React.useState(false);
  const showImage = src && !errored;
  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white items-center justify-center font-semibold",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <span>{initials(name) || "U"}</span>
      )}
    </div>
  );
}
