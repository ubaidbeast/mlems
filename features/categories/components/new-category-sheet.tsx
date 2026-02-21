import z from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { insertCategorySchema } from "@/db/schema";
import { useCreateCategory } from "../api/use-create-category";
import { useNewCategory } from "../hooks/use-new-category";
import { CategoryForm } from "./category-form";

const formSchema = insertCategorySchema.pick({name: true});

type FormValues = z.infer<typeof formSchema>;

export const NewCategorySheet = () => {
    const { isOpen, onClose } = useNewCategory();

    const mutation = useCreateCategory();

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="space-y-4">
                <SheetHeader>
                    <SheetTitle>
                        New Category
                    </SheetTitle>
                    <SheetDescription>
                        Create a new category to organize your transactions.
                    </SheetDescription>
                </SheetHeader>
                <CategoryForm onSubmit={(onSubmit)} defaultValues={{name: ""}} disabled={mutation.isPending}/>
            </SheetContent>
        </Sheet>
    )
}