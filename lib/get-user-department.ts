import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { getCurrentUserRole } from "@/lib/server-role";

export const getUserDepartmentByClerkId = async (clerkId: string): Promise<string | null> => {
    if (!clerkId) {
        console.log("no clerk");
        
        return null;
    }

    const [user] = await db
        .select({ department: users.department })
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

    console.log(user ? "found user department" : "no user found for clerkId", user);
    
    return user?.department ?? null;
};

export const getCurrentUserDepartment = async (): Promise<string | null> => {
    const { userId } = await auth();

    if (!userId) {
        console.log("no user");
        
        return null;
    }

    console.log("userID", userId);
    

    return getUserDepartmentByClerkId(userId);
};

export type UserAuthInfo = {
    role: ReturnType<typeof getCurrentUserRole> extends Promise<infer T> ? T : never;
    department: string | null;
};

export const getCurrentUserAuthInfo = async (): Promise<UserAuthInfo> => {
    const [role, department] = await Promise.all([
        getCurrentUserRole(),
        getCurrentUserDepartment(),
    ]);

    return {
        role: role ?? "employee",
        department,
    };
};
