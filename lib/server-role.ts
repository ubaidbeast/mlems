import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppRole, checkRole, getRoleFromSessionClaims } from "@/lib/roles";

export const getCurrentUserRole = async (): Promise<AppRole | null> => {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        return null;
    }

    return getRoleFromSessionClaims(sessionClaims);
};

export const requireRole = async (role: AppRole) => {
    const { userId, sessionClaims } = await auth();

    if (!userId || !checkRole(sessionClaims, role)) {
        return false;
    }

    return true;
};

export const requireAdmin = async () => {
    return requireRole("admin");
};

export const requireAdminOrRedirect = async (redirectTo: string = "/") => {
    const isAllowed = await requireAdmin();

    if (!isAllowed) {
        redirect(redirectTo);
    }
};
