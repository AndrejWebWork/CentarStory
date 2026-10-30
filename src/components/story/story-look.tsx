"use client";

import { useState } from "react";
import { mediaSrc, mediaSrcSet } from "@/lib/media/src";
import type { MediaAsset } from "@/content/knowledge/schema";

export function StoryLook({
  image,
  alt,
  notes,
  openLabel,
  hideLabel,
  lead,
}: {
  image: MediaAsset;
  alt: string;
  notes: string[];
  openLabel: string;
  hideLabel: string;
  lead: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <figure className="overflow-hidden border border-line bg-foam">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaSrc(image, 1280)}
          srcSet={mediaSrcSet(image)}
          sizes="(min-width: 1024px) 58vw, 100vw"
          alt={alt}
          className="aspect-[16/10] w-full object-cover"
        />
        {open ? (
          <div className="absolute inset-0 flex flex-col justify-end bg-ink/55 p-5 text-foam">
            <p className="text-[11px] tracking-[0.18em] uppercase">{lead}</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed">
              {notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <figcaption className="flex flex-wrap items-center justify-end gap-3 px-4 py-3">
        <button
          type="button"
          className="inline-flex h-11 items-center text-sm text-copper"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          {open ? hideLabel : openLabel}
        </button>
      </figcaption>
    </figure>
  );
}
