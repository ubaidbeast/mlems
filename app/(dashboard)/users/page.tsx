import { asc, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { accounts, users } from "@/db/schema";
import { UsersDepartmentsManager } from "./users-departments-manager";

const UsersPage = async () => {
    const [usersData, departmentsData] = await Promise.all([
        db
            .select({
                id: users.id,
                clerkId: users.clerkId,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
                departmentId: users.department,
                departmentName: accounts.name,
            })
            .from(users)
            .leftJoin(accounts, eq(users.department, accounts.id))
            .orderBy(asc(users.firstName), asc(users.lastName), asc(users.email)),
        db
            .select({
                id: accounts.id,
                name: accounts.name,
            })
            .from(accounts)
            .orderBy(asc(accounts.name)),
    ]);

    return <UsersDepartmentsManager users={usersData} departments={departmentsData} />;
};

export default UsersPage;
