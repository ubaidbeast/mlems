import { redirect } from "next/navigation";

import { getCurrentUserAuthInfo } from "@/lib/get-user-department";

type Props = {
    children: React.ReactNode;
};

const TransactionsLayout = async ({ children }: Props) => {
    const { role, department } = await getCurrentUserAuthInfo();

    if (role !== "admin" && !department) {
        redirect("/");
    }

    return <>{children}</>;
};

export default TransactionsLayout;
