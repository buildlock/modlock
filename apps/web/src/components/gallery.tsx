"use client";
import { useState } from "react";
import { ModImage } from "./mod-image";
export function Gallery({
  images,
  title,
}: {
  images: { url: string; thumbnail: string; caption: string }[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="gallery-main">
        <ModImage
          src={images[active]?.url}
          alt={images[active]?.caption || title}
          priority
          sizes="(max-width:800px) 100vw, 65vw"
        />
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs" aria-label="Mod screenshots">
          {images.map((image, i) => (
            <button
              className={i === active ? "selected" : ""}
              aria-label={`Show screenshot ${i + 1}`}
              aria-pressed={i === active}
              key={`${image.url}-${i}`}
              onClick={() => setActive(i)}
            >
              <ModImage
                src={image.thumbnail}
                alt={image.caption || `Screenshot ${i + 1}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
