"use client";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";
export function ModImage({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 25vw",
}: {
  src?: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed)
    return (
      <div className="image-placeholder">
        <ImageOff size={28} />
        <span>Preview unavailable</span>
      </div>
    );
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailed(true)}
      referrerPolicy="no-referrer"
    />
  );
}
