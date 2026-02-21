import z from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useOpenCategory } from "../hooks/use-open-category";

import { insertCategorySchema } from "@/db/schema";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteCategory } from "../api/use-delete-category";
import { useGetCategory } from "../api/use-get-category";
import { useEditCategory } from "../api/use-edit-category";
import { CategoryForm } from "./category-form";
import { Loader2 } from "lucide-react";

const formSchema = insertCategorySchema.pick({name: true});

type FormValues = z.infer<typeof formSchema>;

export const EditCategorySheet = () => {
    const { isOpen, onClose, id } = useOpenCategory();

    const [ConfirmationDialog, confirm] = useConfirm(
        "Are you sure?",
        "You are about to delete this category"
    )

    const categoryQuery = useGetCategory(id)
    const editMutation = useEditCategory(id);
    const deleteMutation = useDeleteCategory(id);

    const isPending = editMutation.isPending || deleteMutation.isPending;

    const isLoading = categoryQuery.isLoading;

    const onSubmit = (values: FormValues) => {
        editMutation.mutate(values, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    const onDelete = async () => {
        const ok = await confirm();

        if(ok) {
            deleteMutation.mutate(undefined, {
                onSuccess: () => {
                    onClose();
                }
            });
        }
    }

    const defaultValues = {
        name: categoryQuery.data?.name || "",
    }

    return (
        <>
            <ConfirmationDialog />
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="space-y-4">
                    <SheetHeader>
                        <SheetTitle>
                            Edit Category
                        </SheetTitle>
                        <SheetDescription>
                            Update an existing category.
                        </SheetDescription>
                    </SheetHeader>
                    {isLoading ?
                        (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="size-4 text-muted-foreground animate-spin"/>
                            </div>
                        ) : (

                            <CategoryForm id={id} onSubmit={(onSubmit)} defaultValues={defaultValues} disabled={isPending} onDelete={onDelete}/>
                        )}
                </SheetContent>
            </Sheet>
        </>
    )
}