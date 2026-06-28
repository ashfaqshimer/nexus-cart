"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, X } from "lucide-react";

import type { ProductActionState } from "@/app/admin/products/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AdminProduct } from "@/lib/queries/products";

const NO_CATEGORY = "none";

type CategoryOption = { id: number; name: string };

type ProductFormProps = {
  /** Bound server action — createProductAction, or updateProductAction.bind(null, id). */
  action: (
    state: ProductActionState,
    formData: FormData,
  ) => Promise<ProductActionState>;
  categories: CategoryOption[];
  /** Present when editing; absent when creating. */
  product?: AdminProduct | null;
  submitLabel: string;
};

const initialState: ProductActionState = {};

export function ProductForm({
  action,
  categories,
  product,
  submitLabel,
}: ProductFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  const [categoryId, setCategoryId] = useState<string>(
    product?.categoryId != null ? String(product.categoryId) : NO_CATEGORY,
  );
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [imageUrl, setImageUrl] = useState("");

  const fieldErrors = state.fieldErrors ?? {};

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

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={product?.name ?? ""}
          required
        />
        <FieldError message={fieldErrors.name} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={product?.slug ?? ""}
          placeholder="Leave blank to generate from the name"
        />
        <FieldError message={fieldErrors.slug} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
        />
        <FieldError message={fieldErrors.description} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            defaultValue={product ? (product.price / 100).toFixed(2) : ""}
            required
          />
          <FieldError message={fieldErrors.price} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product ? String(product.stock) : "0"}
          />
          <FieldError message={fieldErrors.stock} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Category</Label>
        {/* Base UI submits the selected string via the `name` hidden input. */}
        <Select
          name="categoryId"
          value={categoryId}
          onValueChange={(value) => setCategoryId(String(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value) =>
                value && value !== NO_CATEGORY
                  ? (categories.find((c) => String(c.id) === value)?.name ??
                    "No category")
                  : "No category"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_CATEGORY}>No category</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={fieldErrors.categoryId} />
      </div>

      {/* Image manager — pasted URLs only for now. SWAP POINT (Phase 5): replace
          this block with components/admin/image-input.tsx for file uploads. */}
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
        {images.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {images.map((url) => (
              <li
                key={url}
                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
              >
                <input type="hidden" name="images" value={url} />
                <span className="truncate">{url}</span>
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

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Button
          type="button"
          variant="ghost"
          nativeButton={false}
          render={<Link href="/admin/products" />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}
