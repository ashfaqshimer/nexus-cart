"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";

import { deleteProductAction } from "@/app/admin/products/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteProductButton({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${name}`}
          />
        }
      >
        <Trash2 className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete product</DialogTitle>
          <DialogDescription>
            Delete “{name}”? This can’t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <form action={deleteProductAction.bind(null, id)}>
            <DeleteSubmit />
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
