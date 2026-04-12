import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { accounts, insertAccountSchema } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { HTTPException } from "hono/http-exception";
import { and, eq, inArray } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import z from "zod";
import { id } from "zod/v4/locales";
import { getRoleFromSessionClaims, isAdmin } from "@/lib/roles";
import { getUserDepartmentByClerkId } from "@/lib/get-user-department";

const app = new Hono()
    .get("/",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if(!auth?.userId) {
                throw new HTTPException(401, {
                    res: c.json({error: "unauthorized"}, 401)
                });
            }

            const role = getRoleFromSessionClaims(auth.sessionClaims);

            if (role !== "admin") {
                const departmentId = await getUserDepartmentByClerkId(auth.userId);

                if (!departmentId) {
                    return c.json({ data: [] });
                }

                const data = await db
                    .select({
                        id: accounts.id,
                        name: accounts.name,
                    })
                    .from(accounts)
                    .where(eq(accounts.id, departmentId));

                return c.json({ data });
            }
            
            const data = await db.select({
                id: accounts.id,
                name: accounts.name,
                        }). from(accounts);
            return c.json({data})
    })
    .get(
        "/:id",
        zValidator("param", z.object({id: z.string().optional()})),
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if(!id) {
                return c.json({error: "missing id"}, 400);
            }

            if(!auth?.userId) {
                return c.json({error: "unauthorized"}, 401);
            }

            const role = getRoleFromSessionClaims(auth.sessionClaims);

            if (role !== "admin") {
                const departmentId = await getUserDepartmentByClerkId(auth.userId);

                if (!departmentId) {
                    return c.json({ error: "forbidden" }, 403);
                }

                if (departmentId !== id) {
                    return c.json({ error: "forbidden" }, 403);
                }
            }

            const [data] = await db
            .select({
                id: accounts.id,
                name: accounts.name,
            })
            .from(accounts)
            .where(eq(accounts.id, id));

            if(!data) {
                return c.json({error: "account not found"}, 404);
            }
            
            return c.json({ data });
    }
    )
    .post("/",
        clerkMiddleware(),
        zValidator("json", insertAccountSchema.pick({name: true})),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if(!auth?.userId){
                return c.json({error: "unauthorized"}, 401);
            }

            if (!isAdmin(auth.sessionClaims)) {
                return c.json({ error: "forbidden" }, 403);
            }

            const [data] = await db.insert(accounts).values({
                id: createId(),
                userId: auth?.userId,
                ...values,
            }).returning();
            
            return c.json({ data });
    })
    .post(
        "/bulk-delete",
        clerkMiddleware(),
        zValidator(
            "json",
            z.object({
                ids: z.array(z.string())
            })
        ),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if(!auth?.userId){
                return c.json({error: "unauthorized"}, 401);
            }

            if (!isAdmin(auth.sessionClaims)) {
                return c.json({ error: "forbidden" }, 403);
            }

            const data = await db
                .delete(accounts)
                .where(inArray(accounts.id, values.ids))
                .returning(
                    {id: accounts.id}
                );

            return c.json({ data });
        }
    )
    .patch(
        "/:id",
        clerkMiddleware(),
        zValidator("param", z.object({id: z.string().optional()})),
        zValidator("json", insertAccountSchema.pick({name: true})),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");
            const values = c.req.valid("json");

            if(!id) {
                return c.json({error: "missing id"}, 400);
            }

            if(!auth?.userId) {
                return c.json({error: "unauthorized"}, 401);
            }

            if (!isAdmin(auth.sessionClaims)) {
                return c.json({ error: "forbidden" }, 403);
            }

            const [data] = await db
                .update(accounts)
                .set(values)
                .where(eq(accounts.id, id))
                .returning();

            if(!data) {
                return c.json({error: "account not found"}, 404);
            }
             
            return c.json({ data });
        }
    ).delete(
        "/:id",
        clerkMiddleware(),
        zValidator("param", z.object({id: z.string().optional()})),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if(!id) {
                return c.json({error: "missing id"}, 400);
            }

            if(!auth?.userId) {
                return c.json({error: "unauthorized"}, 401);
            }

            if (!isAdmin(auth.sessionClaims)) {
                return c.json({ error: "forbidden" }, 403);
            }

            const [data] = await db
                .delete(accounts)
                .where(eq(accounts.id, id))
                .returning({
                    id: accounts.id,
                });

            if(!data) {
                return c.json({error: "account not found"}, 404);
            }
             
            return c.json({ data });
        }
    )

export default app;