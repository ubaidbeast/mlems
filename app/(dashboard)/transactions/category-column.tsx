import { useOpenCategory } from "@/features/categories/hooks/use-open-category";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { cn } from "@/lib/utils";
import { getRoleFromSessionClaims } from "@/lib/roles";
import { useAuth } from "@clerk/nextjs";
import { TriangleAlert } from "lucide-react";

type Props = {
    id: string;
    category: string | null;
    categoryId: string | null;
}

export const CategoryColumn = ({ id, category, categoryId }: Props) => {
    const { onOpen: onOpenCategory } = useOpenCategory();
    const { onOpen: onOpenTransaction } = useOpenTransaction();
    const { sessionClaims } = useAuth();

    const isAdmin = getRoleFromSessionClaims(sessionClaims) === "admin";


    const handleClick = () => {
        if (!isAdmin) {
            return;
        }

        if(categoryId) {
            onOpenCategory(categoryId);
        } else {
            onOpenTransaction(id);
        }
    }

    return (
        <div onClick={handleClick} className={cn("flex items-center", isAdmin && "cursor-pointer hover:underline", !category && "text-rose-500")}>
            {!category && <TriangleAlert className="mr-2 size-4 shrink-0"/>}
            {category || "Uncategorized"}
        </div>
    )
}