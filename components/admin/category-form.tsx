"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { CategoryActionState } from "@/app/admin/categories/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/lib/queries/categories";

type CategoryFormProps = {
  /** Bound server action — createCategoryAction, or updateCategoryAction.bind(null, id). */
  action: (
    state: CategoryActionState,
    formData: FormData,
  ) => Promise<CategoryActionState>;
  /** Present when editing; absent when creating. */
  category?: Category | null;
  submitLabel: string;
};

const initialState: CategoryActionState = {};

export function CategoryForm({
  action,
  category,
  submitLabel,
}: CategoryFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={category?.name ?? ""}
          required
        />
        <FieldError message={fieldErrors.name} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={category?.slug ?? ""}
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
          defaultValue={category?.description ?? ""}
        />
        <FieldError message={fieldErrors.description} />
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
          render={<Link href="/admin/categories" />}
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
