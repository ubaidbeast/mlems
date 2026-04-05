import { requireAdminOrRedirect } from "@/lib/server-role";

type Props = {
    children: React.ReactNode;
};

const CategoriesLayout = async ({ children }: Props) => {
    await requireAdminOrRedirect("/");

    return <>{children}</>;
};

export default CategoriesLayout;
