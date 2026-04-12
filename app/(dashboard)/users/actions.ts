"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/drizzle";
import { accounts, users } from "@/db/schema";
import { requireAdmin } from "@/lib/server-role";

type AssignDepartmentInput = {
    userId: string;
    departmentId: string | null;
};

export const assignDepartmentToUser = async ({ userId, departmentId }: AssignDepartmentInput) => {
    const isAllowed = await requireAdmin();

    if (!isAllowed) {
        return { error: "Forbidden" };
    }

    if (!userId) {
        return { error: "User id is required" };
    }

    if (departmentId) {
        const [department] = await db
            .select({ id: accounts.id })
            .from(accounts)
            .where(eq(accounts.id, departmentId))
            .limit(1);

        if (!department) {
            return { error: "Department not found" };
        }
    }

    const [updatedUser] = await db
        .update(users)
        .set({
            department: departmentId,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({ id: users.id });

    if (!updatedUser) {
        return { error: "User not found" };
    }

    revalidatePath("/users");

    return { success: true };
};
