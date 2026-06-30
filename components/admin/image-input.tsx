"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Plus, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImageInputProps = {
  /** Initial image URLs (the product's saved images when editing). */
  initialImages: string[];
};

/**
 * Manages a product's image URLs from two sources — pasted URLs and uploaded
 * files (POSTed to /api/admin/upload, which returns a public Vercel Blob URL).
 *
 * Serializes the list to repeated hidden `<input name="images">` so the existing
 * Server Action reads them unchanged via `formData.getAll("images")`.
 *
 * Thumbnails use `next/image` with `unoptimized` so an arbitrary pasted host
 * renders in this editor without needing a `next.config.ts` allowlist entry.
 */
export function ImageInput({ initialImages }: ImageInputProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addImage() {
    const url = imageUrl.trim();
    if (!url || images.includes(url)) {
      setImageUrl("");
      return;
    }
    setImages((prev) => [...prev, url]);
    setImageUrl("");
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function uploadFile(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setUploadError(data.error ?? "Upload failed. Please try again.");
        return;
      }
      setImages((prev) =>
        prev.includes(data.url!) ? prev : [...prev, data.url!],
      );
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="image-url">Images</Label>

      <div className="flex gap-2">
        <Input
          id="image-url"
          type="url"
          placeholder="https://picsum.photos/600/600"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addImage();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addImage}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4" />
          {uploading ? "Uploading…" : "Upload file"}
        </Button>
        {uploadError ? (
          <p role="alert" className="text-sm text-destructive">
            {uploadError}
          </p>
        ) : null}
      </div>

      {images.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {images.map((url) => (
            <li
              key={url}
              className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
            >
              <input type="hidden" name="images" value={url} />
              <div className="flex min-w-0 items-center gap-3">
                <Image
                  src={url}
                  alt=""
                  width={48}
                  height={48}
                  unoptimized
                  className="size-12 shrink-0 rounded object-cover"
                />
                <span className="truncate">{url}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeImage(url)}
                aria-label={`Remove ${url}`}
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No images added yet.</p>
      )}
    </div>
  );
}
