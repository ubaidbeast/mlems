import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { getRoleFromSessionClaims } from "@/lib/roles";
import { useAuth } from "@clerk/nextjs";

type Props = {
    account: string;
    accountId: string;
}

export const AccountColumn = ({ account, accountId }: Props) => {
    const { onOpen: onOpenAccount } = useOpenAccount();
    const { sessionClaims } = useAuth();

    const isAdmin = getRoleFromSessionClaims(sessionClaims) === "admin";

    const handleClick = () => {
        if (!isAdmin) {
            return;
        }

        onOpenAccount(accountId);
    }

    return (
        <div onClick={handleClick} className={isAdmin ? "flex items-center cursor-pointer hover:underline" : "flex items-center"}>
            {account}
        </div>
    )
}