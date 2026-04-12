import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getRoleFromSessionClaims } from "@/lib/roles";
import { getUserDepartmentByClerkId } from "@/lib/get-user-department";

export async function GET() {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const role = getRoleFromSessionClaims(sessionClaims);

    if (role === "admin") {
        return NextResponse.json({ hasDepartment: true });
    }

    const department = await getUserDepartmentByClerkId(userId);

    return NextResponse.json({ hasDepartment: Boolean(department) });
}
