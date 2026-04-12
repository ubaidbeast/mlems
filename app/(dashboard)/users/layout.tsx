import { requireAdminOrRedirect } from "@/lib/server-role";

type Props = {
    children: React.ReactNode;
};

const UsersLayout = async ({ children }: Props) => {
    await requireAdminOrRedirect("/");

    return <>{children}</>;
};

export default UsersLayout;
