"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";

import { deleteCategoryAction } from "@/app/admin/categories/actions";
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

export function DeleteCategoryButton({
  id,
  name,
  productCount,
}: {
  id: number;
  name: string;
  productCount: number;
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
          <DialogTitle>Delete category</DialogTitle>
          <DialogDescription>
            Delete “{name}”? This can’t be undone.
            {productCount > 0
              ? ` ${productCount} ${
                  productCount === 1 ? "product" : "products"
                } will be left uncategorized.`
              : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <form action={deleteCategoryAction.bind(null, id)}>
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
