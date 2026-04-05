import { requireAdminOrRedirect } from "@/lib/server-role";

type Props = {
    children: React.ReactNode;
};

const DepartmentsLayout = async ({ children }: Props) => {
    await requireAdminOrRedirect("/");

    return <>{children}</>;
};

export default DepartmentsLayout;
