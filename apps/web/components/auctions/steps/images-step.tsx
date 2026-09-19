// features/auctions/components/steps/images-step.tsx
"use client";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { uploadImageToImageKit, deleteImageFromImageKit } from "@/lib/imagekit-upload";
import { Star, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { AuctionFormValues } from "../form-types";

const MAX_IMAGES = 5;

export function ImagesStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<AuctionFormValues>();

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "images",
  });

  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList).slice(0, MAX_IMAGES - fields.length);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const uploaded = await uploadImageToImageKit(file);
        append({
          fileId: uploaded.fileId,
          url: uploaded.url,
          thumbnailUrl: uploaded.thumbnailUrl,
          isPrimary: fields.length === 0, // first image ever added defaults to primary
          displayOrder: fields.length,
        });
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove(index: number) {
    const image = fields[index];
    remove(index);
    // Best-effort cleanup — failure here doesn't block the form.
    deleteImageFromImageKit(image.fileId).catch(() => {});

    // If we just removed the primary image, promote the next one.
    if (image.isPrimary && fields.length > 1) {
      const nextIndex = index === 0 ? 0 : index - 1;
      update(nextIndex, { ...fields[nextIndex], isPrimary: true });
    }
  }

  function setPrimary(index: number) {
    fields.forEach((_, i) => {
      update(i, { ...fields[i], isPrimary: i === index });
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Add up to {MAX_IMAGES} photos. Click the star to set the cover image.
      </p>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="group relative aspect-square overflow-hidden rounded-md border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={field.thumbnailUrl || field.url}
              alt=""
              className="h-full w-full object-cover"
            />

            <button
              type="button"
              onClick={() => setPrimary(index)}
              className="absolute left-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white"
              aria-label="Set as cover image"
            >
              <Star
                className="h-3.5 w-3.5"
                fill={field.isPrimary ? "currentColor" : "none"}
              />
            </button>

            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {field.isPrimary && (
              <span className="absolute bottom-1.5 left-1.5 rounded-sm bg-brand-accent px-1.5 py-0.5 text-[10px] font-medium text-white">
                Cover
              </span>
            )}
          </div>
        ))}

        {fields.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs">{uploading ? "Uploading..." : "Add"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {errors.images && (
        <FieldError>{errors.images.message as string}</FieldError>
      )}
    </div>
  );
}