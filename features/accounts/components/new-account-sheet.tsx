import z from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useNewAccount } from "../hooks/use-new-account";
import { AccountForm } from "./account-form";
import { insertAccountSchema } from "@/db/schema";
import { useCreateAccount } from "../api/use-create-accounts";

const formSchema = insertAccountSchema.pick({name: true});

type FormValues = z.infer<typeof formSchema>;

export const NewAccountSheet = () => {
    const { isOpen, onClose } = useNewAccount();

    const mutation = useCreateAccount();

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
                        New Account
                    </SheetTitle>
                    <SheetDescription>
                        Create a new account to track your expenses.
                    </SheetDescription>
                </SheetHeader>
                <AccountForm onSubmit={(onSubmit)} defaultValues={{name: ""}} disabled={mutation.isPending}/>
            </SheetContent>
        </Sheet>
    )
}